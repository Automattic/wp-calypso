/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import QueryPreferences from 'components/data/query-preferences';
import { savePreference } from 'state/preferences/actions';
import { getPreference } from 'state/preferences/selectors';

const FollowingIntro = ( props ) => {

	if ( ! props.isNewReader ) {
		return null;
	}

	return (
		<header className="following__intro">
			<QueryPreferences />
			<div className="following__intro-header">
				<div className="following__intro-copy">
						{ props.translate(
							'{{strong}}Welcome!{{/strong}} Reader is a custom magazine. ' +
							'{{link}}Follow your favorite sites{{/link}} and their latest ' +
							'posts will appear here. {{span}}Read, like, and comment in a ' +
							'distraction-free environment.{{/span}}',
							{
								components: {
									link: <a href="/following/edit" />,
									strong: <strong />,
									span: <span className="following__intro-copy-hidden" />
								}
							}
						) }
				</div>

				<div className="following__intro-close"
					onClick={ props.dismiss }
					title={ props.translate( 'Close' ) }
					aria-label={ props.translate( 'Close' ) }>
						<Gridicon icon="cross-circle" className="following__intro-close-icon" title={ props.translate( 'Close' ) } />
						<span className="following__intro-close-icon-bg" />
				</div>
			</div>
		</header>
	);
};

export default connect(
	( state ) => {
		return {
			isNewReader: getPreference( state, 'is_new_reader' )
		};
	},
	( dispatch ) => bindActionCreators( {
		dismiss: () => {
			return savePreference( 'is_new_reader', false );
		}
	}, dispatch )
)( localize( FollowingIntro ) );
