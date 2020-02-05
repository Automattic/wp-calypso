/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { Button, Card, CompactCard } from '@automattic/components';
import page from 'page';
/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';
import HeaderCake from 'components/header-cake';
import wpLib from 'lib/wp';
/**
 * Style dependencies
 */
import './section-migrate.scss';
import SitesBlock from 'my-sites/migrate/components/sites-block';
import { redirectTo } from 'my-sites/migrate/helpers';

const wpcom = wpLib.undocumented();

class StepSourceSelect extends Component {
	static propTypes = {
		onSiteInfoReceived: PropTypes.func.isRequired,
		onUrlChange: PropTypes.func.isRequired,
		targetSite: PropTypes.object.isRequired,
		targetSiteSlug: PropTypes.string.isRequired,
	};

	state = {
		error: null,
		isLoading: false,
	};

	handleContinue = () => {
		if ( this.state.isLoading ) {
			return;
		}

		const validEngines = [ 'wordpress', 'blogger', 'medium', 'wix', 'godaddy', 'squarespace' ];

		this.setState( { error: null, isLoading: true }, () => {
			wpcom
				.isSiteImportable( this.props.url )
				.then( result => {
					const importUrl = `/import/${ this.props.targetSiteSlug }?not-wp=1&engine=${ result.site_engine }&from-site=${ result.site_url }`;

					switch ( result.site_engine ) {
						case 'wordpress':
							if ( result.site_engine === 'wpcom' ) {
								return this.setState( {
									error: 'This is site is already hosted on WordPress.com',
									isLoading: false,
								} );
							}

							return this.props.onSiteInfoReceived( result, () => {
								page( `/migrate/choose/${ this.props.targetSiteSlug }` );
							} );
						default:
							if ( validEngines.indexOf( result.site_engine ) === -1 ) {
								return this.setState( {
									error: 'This is not a WordPress site',
									isLoading: false,
								} );
							}

							return redirectTo( importUrl );
					}
				} )
				.catch( error => {
					switch ( error.code ) {
						case 'rest_invalid_param':
							return this.setState( {
								error: "We couldn't reach that site. Please check the URL and try again.",
								isLoading: false,
							} );
						default:
							return this.setState( {
								error: 'Something went wrong. Please check the URL and try again.',
								isLoading: false,
							} );
					}
				} );
		} );
	};

	render() {
		const { targetSite, targetSiteSlug } = this.props;
		const backHref = `/import/${ targetSiteSlug }`;
		const uploadHref = `/import/${ targetSiteSlug }?engine=wordpress`;

		return (
			<>
				<HeaderCake backHref={ backHref }>Import from WordPress</HeaderCake>
				<CompactCard>
					<CardHeading>What WordPress site do you want to import?</CardHeading>
					<div className="migrate__explain">
						Enter a URL and we'll help you move your site to WordPress.com. If you already have a
						backup file, you can <a href={ uploadHref }>upload it to import content</a>.
					</div>
				</CompactCard>
				<SitesBlock
					sourceSite={ null }
					loadingSourceSite={ this.state.isLoading }
					targetSite={ targetSite }
					onUrlChange={ this.props.onUrlChange }
					onSubmit={ this.handleContinue }
				/>
				<p>{ this.state.error }</p>
				<Card>
					<Button busy={ this.state.isLoading } onClick={ this.handleContinue } primary={ true }>
						Continue
					</Button>
				</Card>
			</>
		);
	}
}

export default localize( StepSourceSelect );
