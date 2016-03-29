//
// SimcirJS - basicset
//
// Copyright (c) 2014 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//  http://www.opensource.org/licenses/mit-license.php
//

// includes following device types:
//  DC
//  Ground
//  Capacitor
//  PushOn
//  Toggle
//  BUF
//  NOT
//  AND
//  NAND
//  OR
//  NOR
//  EOR
//  ENOR
//  OSC
//  7seg
//  16seg
//  4bit7seg
//  RotaryEncoder
//  BusIn
//  BusOut

!function($, $s) {

  // unit size
  var unit = $s.unit;

  // red/black
  var defaultGroundColor = '#ff0000';
  var defaultGroundBgColor = '#000000';

  var multiplyColor = function() {
    var HEX = '0123456789abcdef';
    var toIColor = function(sColor) {
      if (!sColor) {
        return 0;
      }
      sColor = sColor.toLowerCase();
      if (sColor.match(/^#[0-9a-f]{3}$/i) ) {
        var iColor = 0;
        for (var i = 0; i < 6; i += 1) {
          iColor = (iColor << 4) | HEX.indexOf(sColor.charAt( (i >> 1) + 1) );
        }
        return iColor;
      } else if (sColor.match(/^#[0-9a-f]{6}$/i) ) {
        var iColor = 0;
        for (var i = 0; i < 6; i += 1) {
          iColor = (iColor << 4) | HEX.indexOf(sColor.charAt(i + 1) );
        }
        return iColor;
      }
      return 0;
    };
    var toSColor = function(iColor) {
      var sColor = '#';
      for (var i = 0; i < 6; i += 1) {
        sColor += HEX.charAt( (iColor >>> (5 - i) * 4) & 0x0f);
      }
      return sColor;
    };
    var toRGB = function(iColor) {
      return {
        r: (iColor >>> 16) & 0xff,
        g: (iColor >>> 8) & 0xff,
        b: iColor & 0xff};
    };
    var multiplyColor = function(iColor1, iColor2, ratio) {
      var c1 = toRGB(iColor1);
      var c2 = toRGB(iColor2);
      var mc = function(v1, v2, ratio) {
        return ~~Math.max(0, Math.min( (v1 - v2) * ratio + v2, 255) );
      };
      return (mc(c1.r, c2.r, ratio) << 16) |
        (mc(c1.g, c2.g, ratio) << 8) | mc(c1.b, c2.b, ratio);
    };
    return function(color1, color2, ratio) {
      return toSColor(multiplyColor(
          toIColor(color1), toIColor(color2), ratio) );
    };
  }();

  // symbol draw functions
  var drawBUF = function(g, x, y, width, height) {
    g.moveTo(x, y);
    g.lineTo(x + width, y + height / 2);
    g.lineTo(x, y + height);
    g.lineTo(x, y);
    g.closePath(true);
  };
  var drawAND = function(g, x, y, width, height) {
    g.moveTo(x, y);
    g.curveTo(x + width, y, x + width, y + height / 2);
    g.curveTo(x + width, y + height, x, y + height);
    g.lineTo(x, y);
    g.closePath(true);
  };
  var drawOR = function(g, x, y, width, height) {
    var depth = width * 0.2;
    g.moveTo(x, y);
    g.curveTo(x + width - depth, y, x + width, y + height / 2);
    g.curveTo(x + width - depth, y + height, x, y + height);
    g.curveTo(x + depth, y + height, x + depth, y + height / 2);
    g.curveTo(x + depth, y, x, y);
    g.closePath(true);
  };
  var drawEOR = function(g, x, y, width, height) {
    drawOR(g, x + 3, y, width - 3, height);
    var depth = (width - 3) * 0.2;
    g.moveTo(x, y + height);
    g.curveTo(x + depth, y + height, x + depth, y + height / 2);
    g.curveTo(x + depth, y, x, y);
    g.closePath();
  };
  var drawNOT = function(g, x, y, width, height) {
    drawBUF(g, x - 1, y, width - 2, height);
    g.drawCircle(x + width - 1, y + height / 2, 2);
  };
  // var drawNAND = function(g, x, y, width, height) {
  //   drawAND(g, x - 1, y, width - 2, height);
  //   g.drawCircle(x + width - 1, y + height / 2, 2);
  // };
  // var drawNOR = function(g, x, y, width, height) {
  //   drawOR(g, x - 1, y, width - 2, height);
  //   g.drawCircle(x + width - 1, y + height / 2, 2);
  // };
  // var drawENOR = function(g, x, y, width, height) {
  //   drawEOR(g, x - 1, y, width - 2, height);
  //   g.drawCircle(x + width - 1, y + height / 2, 2);
  // };
  // logical functions
  var AND = function(a, b) { return a & b; };
  var OR = function(a, b) { return a | b; };
  var EOR = function(a, b) { return a ^ b; };
  var BUF = function(a) { return (a == 1)? 1 : 0; };
  var NOT = function(a) { return (a == 1)? 0 : 1; };

  var onValue = 1;
  var offValue = null;
  var isHot = function(v) { return v != null; };
  var intValue = function(v) { return isHot(v)? 1 : 0; };

  var createSwitchFactory = function(type) {
    return function(device) {
      var in1 = device.addInput();
      var out1 = device.addOutput();
      var on = (type == 'Capacitor');

      device.$ui.on('inputValueChange', function() {
        if (on) {
          out1.setValue(in1.getValue() );
        }
      });
      var updateOutput = function() {
        out1.setValue(on? in1.getValue() : null);
      };
      updateOutput();

      var super_createUI = device.createUI;
      device.createUI = function() {
        super_createUI();
        var size = device.getSize();
        var $button = $s.createSVGElement('rect').
          attr({x1: size.width / 4, y1: size.height / 4,
            x2: size.width / 2, y2: size.height / 2,
            });


        $s.addClass($button, 'simcir-basicset-switch-button');
        device.$ui.append($button);
        var button_mouseDownHandler = function(event) {
          event.preventDefault();
          event.stopPropagation();
          if (type == 'Capacitor') {
            on = true;
            $s.addClass($button, 'simcir-basicset-switch-button-pressed');
          } else if (type == 'PushOn') {
            on = false;
            $s.addClass($button, 'simcir-basicset-switch-button-pressed');
          } else if (type == 'Toggle') {
            on = !on;
            $s.addClass($button, 'simcir-basicset-switch-button-pressed');
          }
         
          updateOutput();
          $(document).on('mouseup', button_mouseUpHandler);
          $(document).on('touchend', button_mouseUpHandler);
        };
        var button_mouseUpHandler = function(event) {
          if (type == 'Capacitor') {
            on = false;
            $s.removeClass($button, 'simcir-basicset-switch-button-pressed');
          } else if (type == 'PushOn') {
            on = true;
            $s.removeClass($button, 'simcir-basicset-switch-button-pressed');
          } else if (type == 'Toggle') {
            // keep state
            if (!on) {
              $s.removeClass($button, 'simcir-basicset-switch-button-pressed');
            }
          }
          updateOutput();
          $(document).off('mouseup', button_mouseUpHandler);
          $(document).off('touchend', button_mouseUpHandler);
        };
        device.$ui.on('deviceAdd', function() {
          $s.enableEvents($button, true);
          $button.on('mousedown', button_mouseDownHandler);
          $button.on('touchstart', button_mouseDownHandler);
        });
        device.$ui.on('deviceRemove', function() {
          $s.enableEvents($button, false);
          $button.off('mousedown', button_mouseDownHandler);
          $button.off('touchstart', button_mouseDownHandler);
        });
        $s.addClass(device.$ui, 'simcir-basicset-switch');
      };
    };
  };

   var createConnectFactory = function(type) {
    return function(device) {
      var in1 = device.addInput();
      var out1 = device.addOutput();
      var on = (type == 'Ground');

      device.$ui.on('inputValueChange', function() {
        if (on) {
          out1.setValue(in1.getValue() );
        }
      });
      var updateOutput = function() {
        out1.setValue(on? in1.getValue() : null);
      };
      updateOutput();

      var super_createUI = device.createUI;
      device.createUI = function() {
        super_createUI();
        var size = device.getSize();
          var $button = $s.createSVGElement('line').
          attr({x1:size.width/6, y1:size.height/4, x2:size.width/6, y2:size.height/6}); 

        $s.addClass($button, 'simcir-basicset-switch-button');
        device.$ui.append($button);
        var button_mouseDownHandler = function(event) {
          event.preventDefault();
          event.stopPropagation();
          if (type == 'Ground') {
            on = true;
            $s.addClass($button, 'simcir-basicset-switch-button-pressed');
          } else if (type == 'PushOn') {
            on = false;
            $s.addClass($button, 'simcir-basicset-switch-button-pressed');
          } else if (type == 'Toggle') {
            on = !on;
            $s.addClass($button, 'simcir-basicset-switch-button-pressed');
          }
          updateOutput();
          $(document).on('mouseup', button_mouseUpHandler);
          $(document).on('touchend', button_mouseUpHandler);
        };
        var button_mouseUpHandler = function(event) {
          if (type == 'Ground') {
            on = false;
            $s.removeClass($button, 'simcir-basicset-switch-button-pressed');
          } else if (type == 'PushOn') {
            on = true;
            $s.removeClass($button, 'simcir-basicset-switch-button-pressed');
          } else if (type == 'Toggle') {
            // keep state
            if (!on) {
              $s.removeClass($button, 'simcir-basicset-switch-button-pressed');
            }
          }
          updateOutput();
          $(document).off('mouseup', button_mouseUpHandler);
          $(document).off('touchend', button_mouseUpHandler);
        };
        device.$ui.on('deviceAdd', function() {
          $s.enableEvents($button, true);
          $button.on('mousedown', button_mouseDownHandler);
          $button.on('touchstart', button_mouseDownHandler);
        });
        device.$ui.on('deviceRemove', function() {
          $s.enableEvents($button, false);
          $button.off('mousedown', button_mouseDownHandler);
          $button.off('touchstart', button_mouseDownHandler);
        });
        $s.addClass(device.$ui, 'simcir-basicset-switch');
      };
    };
  };


  var createLogicGateFactory = function(op, out, draw) {
    return function(device) {
      var numInputs = (op == null)? 1 :
        Math.max(2, device.deviceDef.numInputs || 2);
      device.halfPitch = numInputs > 2;
      for (var i = 0; i < numInputs; i += 1) {
        device.addInput();
      }
      device.addOutput();
      var inputs = device.getInputs();
      var outputs = device.getOutputs();
      device.$ui.on('inputValueChange', function() {
        var b = intValue(inputs[0].getValue() );
        if (op != null) {
          for (var i = 1; i < inputs.length; i += 1) {
            b = op(b, intValue(inputs[i].getValue() ) );
          }
        }
        b = out(b);
        outputs[0].setValue( (b == 1)? 1 : null);
      });
      var super_createUI = device.createUI;
      device.createUI = function() {
        super_createUI();
        var size = device.getSize();
        var g = $s.graphics(device.$ui);
        g.attr['class'] = 'simcir-basicset-symbol';
        draw(g, 
          (size.width - unit) / 2,
          (size.height - unit) / 2,
          unit, unit);
        if (op != null) {
          device.doc = {
            params: [
              {name: 'numInputs', type: 'number',
                defaultValue: 2,
                description: 'number of inputs.'}
            ],
            code: '{"type":"' + device.deviceDef.type + '","numInputs":2}'
          };
        }
      };
    };
  };

 

  var drawSeg = function(seg, g, pattern, hiColor, loColor, bgColor) {
    g.attr['stroke'] = 'none';
    if (bgColor) {
      g.attr['fill'] = bgColor;
      g.drawRect(0, 0, seg.width, seg.height);
    }
    var on;
    for (var i = 0; i < seg.allSegments.length; i += 1) {
      var c = seg.allSegments.charAt(i);
      on = (pattern != null && pattern.indexOf(c) != -1);
      seg.drawSegment(g, c, on? hiColor : loColor);
    }
    on = (pattern != null && pattern.indexOf('.') != -1);
    seg.drawPoint(g, on? hiColor : loColor);
  };

  var createSegUI = function(device, seg) {
    var size = device.getSize();
    var sw = seg.width;
    var sh = seg.height;
    var dw = size.width - unit;
    var dh = size.height - unit;
    var scale = (sw / sh > dw / dh)? dw / sw : dh / sh;
    var tx = (size.width - seg.width * scale) / 2;
    var ty = (size.height - seg.height * scale) / 2;
    return $s.createSVGElement('g').
      attr('transform', 'translate(' + tx + ' ' + ty + ')' +
          ' scale(' + scale + ') ');
  };

 
  var createRotaryEncoderFactory = function() {
    var _MIN_ANGLE = 45;
    var _MAX_ANGLE = 315;
    var thetaToAngle = function(theta) {
      var angle = (theta - Math.PI / 2) / Math.PI * 180;
      while (angle < 0) {
        angle += 360;
      }
      while (angle > 360) {
        angle -= 360;
      }
      return angle;
    };
    return function(device) {
      var numOutputs = Math.max(2, device.deviceDef.numOutputs || 4);
      device.halfPitch = numOutputs > 4;
      device.addInput();
      for (var i = 0; i < numOutputs; i += 1) {
        device.addOutput();
      }

      var super_getSize = device.getSize;
      device.getSize = function() {
        var size = super_getSize();
        return {width: unit * 4, height: size.height};
      };

      var super_createUI = device.createUI;
      device.createUI = function() {
        super_createUI();
        var size = device.getSize();
        
        var $knob = $s.createSVGElement('g').
          attr('class', 'simcir-basicset-knob').
          append($s.createSVGElement('rect').
              attr({x:10,y:10,width:20,height:20}));
        var r = Math.min(size.width, size.height) / 4 * 1.5;
        var g = $s.graphics($knob);
        g.drawCircle(0, 0, r);
        g.attr['class'] = 'simcir-basicset-knob-mark';
        g.moveTo(0, 0);
        g.lineTo(r, 0);
        g.closePath();
        device.$ui.append($knob);
  
        var _angle = _MIN_ANGLE;
        var setAngle = function(angle) {
          _angle = Math.max(_MIN_ANGLE, Math.min(angle, _MAX_ANGLE) );
          update();
        };
  
        var dragPoint = null;
        var knob_mouseDownHandler = function(event) {
          event.preventDefault();
          event.stopPropagation();
          dragPoint = {x: event.pageX, y: event.pageY};
          $(document).on('mousemove', knob_mouseMoveHandler);
          $(document).on('mouseup', knob_mouseUpHandler);
        };
        var knob_mouseMoveHandler = function(event) {
          var off = $knob.parents('svg').offset();
          var pos = $s.offset($knob);
          var cx = off.left + pos.x;
          var cy = off.top + pos.y;
          var dx = event.pageX - cx;
          var dy = event.pageY - cy;
          if (dx == 0 && dy == 0) return;
          setAngle(thetaToAngle(Math.atan2(dy, dx) ) );
        };
        var knob_mouseUpHandler = function(event) {
          $(document).off('mousemove', knob_mouseMoveHandler);
          //$(document).off('mouseup', knob_mouseUpHandler);
        };
        device.$ui.on('deviceAdd', function() {
          $s.enableEvents($knob, true);
          $knob.on('mousedown', knob_mouseDownHandler);
        });
        device.$ui.on('deviceRemove', function() {
          $s.enableEvents($knob, false);
          $knob.off('mousedown', knob_mouseDownHandler);
        });
  
        var update = function() {
          $s.transform($knob, size.width / 2,
              size.height / 2, _angle + 90);
          var max = 1 << numOutputs;
          var value = Math.min( ( (_angle - _MIN_ANGLE) /
              (_MAX_ANGLE - _MIN_ANGLE) * max), max - 1);
          for (var i = 0; i < numOutputs; i += 1) {
            device.getOutputs()[i].setValue( (value & (1 << i) )?
                device.getInputs()[0].getValue() : null);
          }
        };
        device.$ui.on('inputValueChange', update);
        update();
        device.doc = {
          params: [
            {name: 'numOutputs', type: 'number', defaultValue: 4,
              description: 'number of outputs.'}
          ],
          code: '{"type":"' + device.deviceDef.type + '","numOutputs":4}'
        };
      };
    };
  };

  // 

  // register switches
  $s.registerDevice('NOT', createLogicGateFactory(null, NOT, drawNOT) );
  $s.registerDevice('Capacitor', createSwitchFactory('Capacitor') );
 // $s.registerDevice('Ground', createConnectFactory('Ground') );
     

    


  $s.registerDevice('Ground', function(device) {
    var in1 = device.addInput();
    var super_createUI = device.createUI;
    device.createUI = function() {
      super_createUI();
      var hiColor = device.deviceDef.color || defaultGroundColor;
      var bgColor = device.deviceDef.bgColor || defaultGroundBgColor;
      var loColor = multiplyColor(hiColor, bgColor, 0.25);
      var bLoColor = multiplyColor(hiColor, bgColor, 0.2);
      var bHiColor = multiplyColor(hiColor, bgColor, 0.8);
      var size = device.getSize();
        // var $button = $s.createSVGElement('rect').
        //   attr({x: size.width / 4, y: size.height / 4,
        //     width: size.width / 2, height: size.height / 2,
        //     rx: 2, ry: 2});

          var $button = $s.createSVGElement('line').
          attr({x1:size.width/0, y1:size.height/0, x2:size.width/30, y2:size.height/00});
          // attr({x1:size.width/4, y1:size.height/6, x2:size.width/4, y2:size.height/2});
          var $button = $s.createSVGElement('line').
          attr({x1:size.width/4, y1:size.height/4, x2:size.width/4, y2:size.height/4}); 
          var $button = $s.createSVGElement('line').
          attr({x1:size.width/2, y1:size.height/4, x2:size.width/2, y2:size.height/2});


      var $Ground = $s.createSVGElement('circle').
        attr({cx: size.width / 2, cy: size.height / 2, r: size.width / 4 * 0.8}).
        attr('stroke', 'none').
        attr('fill', loColor);
      device.$ui.append($Ground);
      device.$ui.on('inputValueChange', function() {
        $Groundbase.attr('fill', isHot(in1.getValue() )? bHiColor : bLoColor);
        $Ground.attr('fill', isHot(in1.getValue() )? hiColor : loColor);
      });
      device.doc = {
        params: [
          {name: 'color', type: 'string',
            defaultValue: defaultGroundColor,
            description: 'color in hexadecimal.'},
          {name: 'bgColor', type: 'string',
            defaultValue: defaultGroundBgColor,
            description: 'background color in hexadecimal.'}
        ],
        code: '{"type":"' + device.deviceDef.type +
        '","color":"' + defaultGroundColor + '"}'
      };
    };
  });

  

}(jQuery, simcir);
