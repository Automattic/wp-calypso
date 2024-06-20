#include <napi.h>
#include <iostream>
#include <AuthenticationServices/AuthenticationServices.h>
#include <Cocoa/Cocoa.h>

@interface WebAuthnDelegate : NSObject <ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding>
@property (nonatomic, strong) NSWindow *presentationAnchor;
@end

@implementation WebAuthnDelegate

+ (WebAuthnDelegate *)shared {
    static WebAuthnDelegate *instance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        instance = [[self alloc] init];
    });
    return instance;
}

- (void)performWebAuthn:(NSWindow *)window {
    self.presentationAnchor = window;
    if (@available(macOS 12.0, *)) {
        ASAuthorizationPlatformPublicKeyCredentialProvider *provider = [[ASAuthorizationPlatformPublicKeyCredentialProvider alloc] initWithRelyingPartyIdentifier:@"wordpress.com"];
        NSData *challenge = [NSData dataWithBytes:"1234567890" length:10];
        ASAuthorizationPlatformPublicKeyCredentialAssertionRequest *assertionRequest = [provider createCredentialAssertionRequestWithChallenge:challenge];

        ASAuthorizationController *authorizationController = [[ASAuthorizationController alloc] initWithAuthorizationRequests:@[assertionRequest]];
        authorizationController.delegate = self;
        authorizationController.presentationContextProvider = self;
        [authorizationController performRequests];
    } else {
        NSLog(@"WebAuthn is not supported on this version of macOS.");
    }
}

- (ASPresentationAnchor)presentationAnchorForAuthorizationController:(ASAuthorizationController *)controller API_AVAILABLE(macos(12.0)) {
    return self.presentationAnchor;
}

- (void)authorizationController:(ASAuthorizationController *)controller didCompleteWithAuthorization:(ASAuthorization *)authorization {
    NSLog(@"Authorization successful");
}

- (void)authorizationController:(ASAuthorizationController *)controller didCompleteWithError:(NSError *)error {
    NSLog(@"Authorization failed: %@", error.localizedDescription);
}

@end

Napi::Value PerformWebAuthn(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::Buffer<uint8_t> buffer = info[0].As<Napi::Buffer<uint8_t>>();
    void* windowHandle = *reinterpret_cast<void**>(buffer.Data());
    NSWindow *window = (__bridge NSWindow *)(windowHandle);
    [[WebAuthnDelegate shared] performWebAuthn:window];
    return env.Null();
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "performWebAuthn"), Napi::Function::New(env, PerformWebAuthn));
    return exports;
}

NODE_API_MODULE(native_module, Init)
