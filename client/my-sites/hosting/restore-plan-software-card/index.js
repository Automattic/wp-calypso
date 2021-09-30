import { Button, Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import MaterialIcon from 'calypso/components/material-icon';
import { stripHTML } from 'calypso/lib/formatting/strip-html';
import wpcom from 'calypso/lib/wp';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

function RestorePlanSoftwareCard( props ) {
	const {
		translate,
		siteId,
		successNotice: showSuccessNotice,
		errorNotice: showErrorNotice,
	} = props;

	function requestRestore() {
		wpcom
			.undocumented()
			.restoreAtomicPlanSoftware( siteId )
			.then( () => {
				showSuccessNotice(
					translate( 'Requested restoration of plugins and themes that come with your plan.' )
				);
			} )
			.catch( ( error ) => {
				const message =
					stripHTML( error.message ) ||
					translate( 'Failed to request restoration of plan plugin and themes.' );
				showErrorNotice( message );
			} );
	}

	return (
		<Card className="restore-plan-software-card">
			<MaterialIcon icon="apps" />
			<CardHeading>{ translate( 'Restore Plugins and Themes' ) }</CardHeading>
			<p>
				{ translate(
					'If your website is missing plugins and themes that come with your plan, you may restore them here.'
				) }
			</p>
			<Button primary onClick={ requestRestore }>
				{ translate( "Restore Plugins and Themes for My Website's Plan" ) }
			</Button>
		</Card>
	);
}

export default connect(
	( state ) => ( {
		siteId: getSelectedSiteId( state ),
	} ),
	{
		successNotice,
		errorNotice,
	}
)( localize( RestorePlanSoftwareCard ) );
