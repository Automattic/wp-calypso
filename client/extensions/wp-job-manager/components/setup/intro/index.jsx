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
import Card from 'components/card';
import ExternalLink from 'components/external-link';
import SectionHeader from 'components/section-header';

class Intro extends Component {
	skipSetup = () => this.props.goToStep( Steps.CONFIRMATION );

	render() {
		const { translate } = this.props;

		return (
			<div>
				<SectionHeader label={ translate( 'Setup Wizard Introduction' ) } />
				<Card>
					<p>
						{ translate(
							'Thanks for installing {{em}}WP Job Manager{{/em}}!',
							{ components: { em: <em /> } }
						) }
					</p>

					<p>
						{ translate(
							'This setup wizard will help you get started by creating the pages for job submission, ' +
							'job management, and listing your jobs.'
						) }
					</p>

					<p>
						{ translate(
							'If you want to skip the wizard and setup the pages and shortcodes yourself manually, ' +
							'the process is still relatively simple. Refer to the {{docs}}documentation{{/docs}} for help.',
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
					<Button compact
						onClick={ this.skipSetup }>
						{ translate( 'Skip setup. I will set up the plugin manually' ) }
					</Button>
				</Card>
			</div>
		);
	}
}

Intro.propTypes = {
	goToStep: PropTypes.func.isRequired,
	translate: PropTypes.func.isRequired,
};

export default localize( Intro );
