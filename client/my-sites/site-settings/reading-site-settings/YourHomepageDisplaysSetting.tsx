type YourHomepageDisplaysOptions = {
	show_on_front?: 'posts' | 'page';
	page_on_front?: string;
};

type YourHomepageDisplaysSettingProps = {
	value: YourHomepageDisplaysOptions;
	onChange?: ( value: YourHomepageDisplaysOptions ) => void;
	disabled?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const YourHomepageDisplaysSetting = ( { value }: YourHomepageDisplaysSettingProps ) => {
	return null;
};
