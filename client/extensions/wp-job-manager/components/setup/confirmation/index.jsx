/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import ConfirmationLink from './confirmation-link';
import ExternalLink from 'components/external-link';
import FormattedHeader from 'components/formatted-header';
import SectionHeader from 'components/section-header';
import { getSelectedSiteSlug } from 'state/ui/selectors';

const Confirmation = ( { slug, translate } ) => (
	<div>
		<FormattedHeader
			headerText={ translate( 'You\'re ready to start using WP Job Manager!' ) }
			subHeaderText={ translate( 'Wondering what to do now? Here are some of the most common next steps:' ) } />

		<ConfirmationLink
			href={ `/extensions/wp-job-manager/${ slug }` }
			text={ translate( 'Tweak your settings' ) } />

		<ConfirmationLink
			href="#"
			text={ translate( 'Add a job using the admin dashboard' ) } />

		<ConfirmationLink
			href="https://wpjobmanager.com/document/shortcode-reference/#section-1"
			target="_blank"
			text={ translate( 'Add job listings to a page using the [jobs] shortcode' ) } />

		<ConfirmationLink
			href="https://wpjobmanager.com/document/the-job-submission-form/"
			target="_blank"
			text={ translate( 'Learn to use the front-end job submission board' ) } />

		<ConfirmationLink
			href="https://wpjobmanager.com/document/the-job-dashboard/"
			target="_blank"
			text={ translate( 'Learn to use the front-end job dashboard' ) } />

		<Card>
			<p className="confirmation__help">
				{ translate( 'If you need help, you can find more detail in our {{docs}}support documentation{{/docs}}' +
					'or post your question on the {{forums}}WP Job Manager support forums{{/forums}}. Happy hiring!',
					{
						components: {
							docs: (
								<ExternalLink
									icon={ true }
									target="_blank"
									href="https://wpjobmanager.com/documentation/"
								/>
							),
							forums: (
								<ExternalLink
									icon={ true }
									target="_blank"
									href="https://wordpress.org/support/plugin/wp-job-manager"
								/>
							),
						}
					}
				) }
			</p>
		</Card>

		<SectionHeader label={ translate( 'Support WP Job Manager\'s Ongoing Development' ) } />
		<Card>
			<p>
				{ translate( 'There are lots of ways you can support open source software projects like this one: ' +
					'contributing code, fixing a bug, assisting with non-English translation, or just telling your ' +
					'friends about WP Job Manager to help spread the word. We appreciate your support!' ) }
			</p>

			{ translate(
				'{{ul}}' +
					'{{li}} {{star}}{{/star}} {{review}}Leave a positive review{{/review}} {{/li}}' +
					'{{li}} {{globe}}{{/globe}} {{localize}}Contribute a localization{{/localize}} {{/li}}' +
					'{{li}} {{cog}}{{/cog}} {{contribute}}Contribute code or report a bug{{/contribute}} {{/li}}' +
					'{{li}} {{help}}{{/help}} {{forums}}Help other users on the forums{{/forums}} {{/li}}' +
				'{{/ul}}',
				{
					components: {
						ul: <ul className="confirmation__support" />,
						li: <li />,
						star: <Gridicon icon="star" size={ 18 } />,
						globe: <Gridicon icon="globe" size={ 18 } />,
						cog: <Gridicon icon="cog" size={ 18 } />,
						help: <Gridicon icon="help" size={ 18 } />,
						review: (
							<ExternalLink
								icon={ true }
								target="_blank"
								href="https://wordpress.org/support/view/plugin-reviews/wp-job-manager#postform"
							/>
						),
						localize: (
							<ExternalLink
								icon={ true }
								target="_blank"
								href="https://translate.wordpress.org/projects/wp-plugins/wp-job-manager"
							/>
						),
						contribute: (
							<ExternalLink
								icon={ true }
								target="_blank"
								href="https://github.com/mikejolley/WP-Job-Manager"
							/>
						),
						forums: (
							<ExternalLink
								icon={ true }
								target="_blank"
								href="https://wordpress.org/support/plugin/wp-job-manager"
							/>
						),
					}
				}
			) }
		</Card>
	</div>
);

Confirmation.propTypes = {
	slug: PropTypes.string,
	translate: PropTypes.func,
};

const mapStateToProps = state => ( { slug: getSelectedSiteSlug( state ) || '' } );

export default connect( mapStateToProps )( localize( Confirmation ) );
