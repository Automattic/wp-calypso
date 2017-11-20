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
import MeSidebarNavigation from 'me/sidebar-navigation';
import NextStepsBox from './next-steps-box';
import steps from './steps';
import { getNewestSite, userHasAnyPaidPlans } from 'state/selectors';
import {
	recordGoogleEvent as recordGoogleEventAction,
	recordTracksEvent as recordTracksEventAction,
} from 'state/analytics/actions';

class NextSteps extends React.Component {
	componentWillUnmount() {
		window.scrollTo( 0, 0 );
	}

	recordEvent = event => {
		const { isWelcome, recordGoogleEvent, recordTracksEvent } = this.props;

		recordGoogleEvent( 'Me > Next > Welcome Message', event.action );
		recordTracksEvent( 'calypso_me_next_welcome_click', {
			link: event.tracks,
			is_welcome: isWelcome,
		} );
	};

	recordBloggingUniversityLinkClick = () => {
		this.recordEvent( {
			tracks: 'blogging_course',
			action: 'Clicked Blogging University Link',
		} );
	};

	recordDocsLinkClick = () => {
		this.recordEvent( {
			tracks: 'documentation',
			action: 'Clicked Documentation Link',
		} );
	};

	recordDismissLinkClick = () => {
		this.recordEvent( {
			tracks: 'dismiss',
			action: 'Clicked Dismiss Link',
		} );
	};

	renderMeSidebar() {
		if ( ! this.props.isWelcome ) {
			return <MeSidebarNavigation />;
		}
	}

	renderIntroMessage() {
		const { isWelcome, translate } = this.props;

		if ( isWelcome ) {
			return (
				<div className="next-steps__intro">
					<h3 className="next-steps__title">
						{ translate( 'Thanks for signing up for WordPress.com.' ) }
					</h3>
					<p className="next-steps__intro">
						{ translate(
							'Next you can take any of the following steps, ' +
								'join a {{bloggingUniversityLink}}guided blogging course{{/bloggingUniversityLink}}, ' +
								'or check out our {{docsLink}}support documentation{{/docsLink}}.',
							{
								components: {
									bloggingUniversityLink: (
										<a
											href="https://bloggingu.wordpress.com/"
											target="_blank"
											rel="noopener noreferrer"
											onClick={ this.recordBloggingUniversityLinkClick }
										/>
									),
									docsLink: (
										<a
											href="http://en.support.wordpress.com/"
											target="_blank"
											rel="noopener noreferrer"
											onClick={ this.recordDocsLinkClick }
										/>
									),
								},
							}
						) }
					</p>
				</div>
			);
		}
	}

	renderOutroMessage() {
		const { isWelcome, newestSite, translate } = this.props;

		if ( isWelcome ) {
			const dismissLink = '/stats/insights/' + ( newestSite ? newestSite.slug : '' );

			return (
				<div className="next-steps__outro">
					<p>
						{ translate(
							'If you want you can {{a}}skip these steps{{/a}}. You can come back to this page any time.',
							{
								components: {
									a: <a href={ dismissLink } onClick={ this.recordDismissLinkClick } />,
								},
							}
						) }
					</p>
				</div>
			);
		}
	}

	renderSteps() {
		const { hasPlan, isWelcome, newestSite } = this.props;
		let sequence = steps.defaultSequence;

		if ( hasPlan ) {
			sequence = steps.hasPlanSequence;
		}

		return (
			<div className="next-steps__steps">
				{ sequence.map( ( stepName, index ) => {
					const step = steps.definitions( newestSite )[ stepName ];

					return (
						<NextStepsBox
							key={ stepName }
							stepName={ stepName }
							step={ step }
							primary={ index === 0 }
							isWelcome={ isWelcome }
						/>
					);
				} ) }
			</div>
		);
	}

	render() {
		return (
			<div className="main main-column next-steps">
				{ this.renderMeSidebar() }

				{ this.renderIntroMessage() }

				{ this.renderSteps() }

				{ this.renderOutroMessage() }
			</div>
		);
	}
}

export default connect(
	state => ( {
		newestSite: getNewestSite( state ),
		hasPlan: userHasAnyPaidPlans( state ),
	} ),
	{
		recordGoogleEvent: recordGoogleEventAction,
		recordTracksEvent: recordTracksEventAction,
	}
)( localize( NextSteps ) );
