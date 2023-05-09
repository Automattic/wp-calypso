import { useTranslate, TranslateResult } from 'i18n-calypso';

type OwnProps = {
	productName: TranslateResult;
};

const Deprecated: React.FC< OwnProps > = ( { productName } ) => {
	const translate = useTranslate();

	return (
		<p className="display-price__deprecated">
			{ translate( 'The %(productName)s plan is no longer available', {
				args: {
					productName,
				},
				comment: 'productName is the name of Jetpack plan such as Personal',
			} ) }
		</p>
	);
};

export default Deprecated;
