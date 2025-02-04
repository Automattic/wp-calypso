import AppPromo from '..';

export default function AppPromoExample() {
	return (
		<>
			<AppPromo />
			<AppPromo title="This is the title" />
			<AppPromo iconSize="199" />
			<AppPromo iconSize="32" subheader="this is a subheader" hasQRCode />
		</>
	);
}

AppPromoExample.displayName = 'AppPromo';
