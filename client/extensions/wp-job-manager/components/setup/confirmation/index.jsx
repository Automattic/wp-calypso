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
import ExternalLink from 'components/external-link';
import SectionHeader from 'components/section-header';
import { getSelectedSiteSlug } from 'state/ui/selectors';

const Confirmation = ( { slug, translate } ) => {
	return (
		<div>
			<SectionHeader label={ translate( 'All Done!' ) } />
			<Card>
				<p>
					{ translate( 'Looks like you\'re all set to start using the plugin. In case you\'re wondering where to go next:' ) }
				</p>

				{ translate(
					'{{ul}}' +
						'{{li}} {{settings}}Tweak the plugin settings{{/settings}} {{/li}}' +
						'{{li}} {{addJob}}Add a job via the back-end{{/addJob}} {{/li}}' +
						'{{li}} {{submission}}Find out more about the front-end job submission form{{/submission}} {{/li}}' +
						'{{li}} {{jobs}}Add the [jobs] shortcode to a page to list jobs{{/jobs}} {{/li}}' +
						'{{li}} {{dashboard}}Find out more about the front-end job dashboard{{/dashboard}} {{/li}}' +
					'{{/ul}}',
					{
						components: {
							ul: <ul />,
							li: <li />,
							settings: <a href={ `/extensions/wp-job-manager/${ slug }` } />,
							addJob: <a href="#" />,
							submission: (
								<ExternalLink
									icon={ true }
									target="_blank"
									href="https://wpjobmanager.com/document/the-job-submission-form/"
								/>
							),
							jobs: (
								<ExternalLink
									icon={ true }
									target="_blank"
									href="https://wpjobmanager.com/document/shortcode-reference/#section-1"
								/>
							),
							dashboard: (
								<ExternalLink
									icon={ true }
									target="_blank"
									href="https://wpjobmanager.com/document/the-job-dashboard/"
								/>
							),
						}
					}
				) }

				<p>
					{ translate( 'And don\'t forget, if you need any more help using WP Job Manager you can ' +
						'consult the {{docs}}documentation{{/docs}} or {{forums}}post on the forums!{{/forums}}',
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

			<SectionHeader label={ translate( 'Support the Ongoing Development of this Plugin' ) } />
			<Card>
				<p>
					{ translate( 'There are many ways to support open-source projects such as WP Job Manager, ' +
						'for example code contribution, translation, or even telling your friends how awesome ' +
						'the plugin (hopefully) is. Thanks in advance for your support - it is much appreciated!' ) }
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
							star: <Gridicon icon="star" size="18" />,
							globe: <Gridicon icon="globe" size="18" />,
							cog: <Gridicon icon="cog" size="18" />,
							help: <Gridicon icon="help" size="18" />,
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
};

Confirmation.propTypes = {
	slug: PropTypes.string,
	translate: PropTypes.func,
};

const mapStateToProps = state => ( { slug: getSelectedSiteSlug( state ) || '' } );

export default connect( mapStateToProps )( localize( Confirmation ) );
