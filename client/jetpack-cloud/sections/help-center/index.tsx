import HelpCenter from '@automattic/help-center';
import { useDispatch } from '@wordpress/data';
import AsyncLoad from 'calypso/components/async-load';

export default function JetpackCloudHelpCenter() {
	const { setShowHelpCenter } = useDispatch( 'automattic/help-center' );

	return (
		<>
			<AsyncLoad
				require="calypso/layout/masterbar/masterbar-help-center"
				siteId={ 1 } // TODO: get siteId from somewhere
				tooltip="Help"
				placeholder={ null }
			/>
			<HelpCenter handleClose={ () => setShowHelpCenter( false ) } />
		</>
	);
}
