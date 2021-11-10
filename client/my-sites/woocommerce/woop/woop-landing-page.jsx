import { Button } from '@automattic/components';
import { translate } from 'i18n-calypso';

const WoopLandingPage = ( props ) => {
	const { startSetup } = props;
	return (
		<div className="woop-landing-page">
			<h1>Woop Landing Page</h1>
			<Button onClick={ startSetup } primary>
				{ translate( 'Set up my store!' ) }
			</Button>
		</div>
	);
};

export default WoopLandingPage;
