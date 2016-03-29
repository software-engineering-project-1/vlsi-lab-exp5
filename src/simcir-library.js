// // //
// // // SimcirJS - library
// // //
// // // Copyright (c) 2014 Kazuhiko Arase
// // //
// // // URL: http://www.d-project.com/
// // //
// // // Licensed under the MIT license:
// // //  http://www.opensource.org/licenses/mit-license.php
// // //

// // // includes following device types:
// // //  RS-FF
// // //  JK-FF
// // //  T-FF
// // //  D-FF
// // //  8bitCounter
// // //  HalfAdder
// // //  FullAdder
// // //  4bitAdder
// // //  2to4BinaryDecoder
// // //  3to8BinaryDecoder
// // //  4to16BinaryDecoder
// // 
   // simcir.registerDevice('',
    {
  "width":600,
  "height":200,
  "showToolbox":true,
  "toolbox":[
    {"type":"In"},
    {"type":"Out"},
    {"type":"NOT"},
    {"type":"Capacitor"},
    {"type":"Ground"}
  ],
  "devices":[
    {"type":"In","id":"dev0","x":24,"y":24,"label":"In"},
    {"type":"Out","id":"dev1","x":416,"y":32,"label":"Out"},
    {"type":"NOT","id":"dev2","x":80,"y":24,"label":"NOT"},
    {"type":"NOT","id":"dev3","x":144,"y":24,"label":"NOT"},
    {"type":"NOT","id":"dev4","x":208,"y":24,"label":"NOT"},
    {"type":"NOT","id":"dev5","x":264,"y":24,"label":"NOT"},
    {"type":"NOT","id":"dev6","x":328,"y":24,"label":"NOT"},
    {"type":"-||-","id":"dev7","x":360,"y":80,"label":"Capacitor"},
    {"type":"Ground","id":"dev8","x":424,"y":136,"label":"Ground"}
  ],
  "connectors":[
    {"from":"dev1.in0","to":"dev6.out0"},
    {"from":"dev2.in0","to":"dev0.out0"},
    {"from":"dev3.in0","to":"dev2.out0"},
    {"from":"dev4.in0","to":"dev3.out0"},
    {"from":"dev5.in0","to":"dev4.out0"},
    {"from":"dev6.in0","to":"dev5.out0"},
    {"from":"dev7.in0","to":"dev6.out0"},
    {"from":"dev8.in0","to":"dev7.out0"}
  ]
}
);

// // simcir.registerDevice('5v,in',
// // {
// //   "width":320,
// //   "height":160,
// //   "showToolbox":false,
// //   "toolbox":[
// //   ],
// //   "devices":[
// //     {"type":"NAND","id":"dev0","x":184,"y":32,"label":"NAND"},
// //     {"type":"NAND","id":"dev1","x":184,"y":80,"label":"NAND"},
// //     {"type":"In","id":"dev2","x":136,"y":24,"label":"-||-"},
// //     {"type":"In","id":"dev3","x":136,"y":88,"label":""},
// //     {"type":"Out","id":"dev4","x":232,"y":32,"label":"Q"},
// //     {"type":"Out","id":"dev5","x":232,"y":80,"label":"~Q"},
// //     {"type":"PushOff","id":"dev6","x":88,"y":24,"label":"PushOff"},
// //     {"type":"PushOff","id":"dev7","x":88,"y":88,"label":"PushOff"},
// //     {"type":"DC","id":"dev8","x":40,"y":56,"label":"DC"}
// //   ],
// //   "connectors":[
// //     {"from":"dev0.in0","to":"dev2.out0"},
// //     {"from":"dev0.in1","to":"dev1.out0"},
// //     {"from":"dev1.in0","to":"dev0.out0"},
// //     {"from":"dev1.in1","to":"dev3.out0"},
// //     {"from":"dev2.in0","to":"dev6.out0"},
// //     {"from":"dev3.in0","to":"dev7.out0"},
// //     {"from":"dev4.in0","to":"dev0.out0"},
// //     {"from":"dev5.in0","to":"dev1.out0"},
// //     {"from":"dev6.in0","to":"dev8.out0"},
// //     {"from":"dev7.in0","to":"dev8.out0"}
// //   ]
// // }
// // );
