/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Steps } from '../constants';
import Button from 'components/button';
import CompactCard from 'components/card/compact';
import ExternalLink from 'components/external-link';
import SectionHeader from 'components/section-header';

class Intro extends Component {
	static propTypes = {
		goToStep: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	skipSetup = event => this.props.goToStep( event, Steps.CONFIRMATION );

	startSetup = event => this.props.goToStep( event, Steps.PAGE_SETUP );

	render() {
		const { translate } = this.props;

		return (
			<div>
				<SectionHeader label={ translate( 'Welcome to the Setup Wizard!' ) } />
				<CompactCard>
					<p>
						{ translate(
							'Thanks for installing {{em}}WP Job Manager{{/em}}! Let\'s get your site ready to accept job listings.',
							{ components: { em: <em /> } }
						) }
					</p>

					<p>
						{ translate(
							'This setup wizard will walk you through the process of creating pages for job submissions, ' +
							'management, and listings.'
						) }
					</p>

					<p>
						{ translate(
							'If you\'d prefer to skip this and set up your pages manually, our {{docs}}documentation{{/docs}} ' +
							'will walk you through each step.',
							{
								components: {
									docs: (
										<ExternalLink
											icon={ true }
											target="_blank"
											href="https://wpjobmanager.com/documentation/"
										/>
									),
								}
							}
						) }
					</p>
				</CompactCard>

				<CompactCard>
					<a
						className="intro__skip-setup"
						href="#"
						onClick={ this.skipSetup }>
						{ translate( 'Skip setup. I will set up the plugin manually.' ) }
					</a>
					<Button primary
						className="intro__start-setup"
						onClick={ this.startSetup }>
						{ translate( 'Start Setup' ) }
					</Button>
				</CompactCard>
			</div>
		);
	}
}

export default localize( Intro );
