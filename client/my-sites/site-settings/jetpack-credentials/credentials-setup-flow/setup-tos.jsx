/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Gridicon from 'components/gridicon';
import Button from 'components/button';
import { autoConfigCredentials } from 'state/jetpack/credentials/actions';
import getRewindState from 'state/selectors/get-rewind-state';

const SetupTos = ( { autoConfigure, canAutoconfigure, reset, translate, goToNextStep } ) => (
	<CompactCard className="credentials-setup-flow__tos" highlight="info">
		<Gridicon icon="info" size={ 48 } className="credentials-setup-flow__tos-gridicon" />
		<div className="credentials-setup-flow__tos-text">
			{ canAutoconfigure
				? translate(
						'WordPress.com can obtain the credentials from your ' +
							'current host which are necessary to perform site backups and ' +
							'restores. Do you want to give WordPress.com access to your ' +
							"host's server?"
				  )
				: translate(
						'By adding credentials, you are providing us with access to your server ' +
							'to perform automatic actions (such as backing up or restoring your site) ' +
							'or to manually access your site in case of an emergency.'
				  ) }
		</div>
		<div className="credentials-setup-flow__tos-buttons">
			<Button borderless={ true } onClick={ reset }>
				{ translate( 'Cancel' ) }
			</Button>
			{ canAutoconfigure ? (
				<Button primary onClick={ autoConfigure }>
					{ translate( 'Auto Configure' ) }
				</Button>
			) : (
				<Button primary onClick={ goToNextStep }>
					{ translate( 'Ok, I understand' ) }
				</Button>
			) }
		</div>
	</CompactCard>
);

const mapStateToProps = ( state, { siteId } ) => ( {
	canAutoconfigure: getRewindState( state, siteId ).canAutoconfigure,
} );

const mapDispatchToProps = ( dispatch, { siteId } ) => ( {
	autoConfigure: () => dispatch( autoConfigCredentials( siteId ) ),
} );

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( SetupTos ) );
