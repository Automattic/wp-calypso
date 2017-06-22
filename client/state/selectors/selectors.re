open Js;
open Option;

let get_account_recovery_reset state => state##accountRecovery##reset;

let get_account_recovery_reset_options state => try ((get_account_recovery_reset state)##options##items) {
	| _ => Js.null
};

let get_account_recovery_reset_options state => try ((get_account_recovery_reset state)##options##error) {
	| _ => Js.null
};

let get_account_recovery_reset_password_error state => try ((get_account_recovery_reset state)##resetPassword##error) {
	| _ => Js.null
};

let get_account_recovery_reset_request_error state => try ((get_account_recovery_reset state)##requestReset##error) {
	| _ => Js.null
};

let get_account_recovery_reset_selected_method state => try ((get_account_recovery_reset state)##_method) {
	| _ => Js.null
};

let get_account_recovery_reset_user_data state => try ((get_account_recovery_reset state)##userData) {
	| _ => Js.Obj.empty ()
};
