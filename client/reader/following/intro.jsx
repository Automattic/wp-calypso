/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { hasGraduatedRecommendations } from 'state/reader/start/selectors';
import { requestGraduate } from 'state/reader/start/actions';

const FollowingIntro = ( props ) => {
	if ( props.hasGraduatedRecommendations || props.hasGraduatedRecommendations === null ) {
		return null;
	}

	const handleIntroClose = () => {
		props.requestGraduate();
	};

	return (
		<header className="following__intro">

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
					onClick={ handleIntroClose }
					title={ props.translate( 'Close' ) }
					aria-label={ props.translate( 'Close' ) }>
						<Gridicon icon="cross-circle" className="following__intro-close-icon" title={ props.translate( 'Close' ) } />
						<span className="following__intro-close-icon-bg" />
				</div>

			</div>

		</header>
	);
};

export default connect( ( state ) => {
	return {
		hasGraduatedRecommendations: hasGraduatedRecommendations( state )
	};
}, { requestGraduate } )( localize( FollowingIntro ) );
