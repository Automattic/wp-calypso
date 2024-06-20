{
  "targets": [
    {
      "target_name": "native_module",
      "sources": [ "src/NativeModule/native_module.mm" ],
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "xcode_settings": {
        "MACOSX_DEPLOYMENT_TARGET": "12.0",
        "OTHER_CFLAGS": [ "-std=c++11", "-stdlib=libc++", "-DNAPI_CPP_EXCEPTIONS" ],
        "OTHER_CPLUSPLUSFLAGS": [ "-std=c++11", "-stdlib=libc++", "-fexceptions" ],
        "OTHER_LDFLAGS": [ "-framework", "AuthenticationServices" ]
      },
      "include_dirs": [
        "<!(node -e \"require('node-addon-api').include\")",
        "../node_modules/node-addon-api",
        "../node_modules",
        "../node_modules/node-addon-api/napi.h"
      ],
      "defines": [ "NAPI_VERSION=3", "NAPI_CPP_EXCEPTIONS" ]
    }
  ]
}
