export type WithFormBaseProps = {
	submitForm: ( event: any ) => void;
	isUpdatingUserSettings: boolean;
	setUserSetting: ( settingName: string, value: any ) => void;
	getSetting: ( settingName: string ) => any;
};
