/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { Button, CompactCard, Card } from '@automattic/components';
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

const wpcom = wpLib.undocumented();

class StepSourceSelect extends Component {
	static propTypes = {
		onSiteInfoReceived: PropTypes.func.isRequired,
		onUrlChange: PropTypes.func.isRequired,
		targetSite: PropTypes.object.isRequired,
		targetSiteSlug: PropTypes.string.isRequired,
	};

	state = {
		error: '',
		isLoading: false,
	};

	handleContinue = () => {
		if ( this.state.isLoading ) {
			return;
		}

		this.setState( { error: '', isLoading: true }, () => {
			wpcom
				.isSiteImportable( this.props.url )
				.then( result => {
					const importUrl = `/import/${ this.props.targetSiteSlug }?not-wp=1&engine=${ result.site_engine }&from-site=${ result.site_url }`;

					switch ( result.site_engine ) {
						case 'wordpress':
							return this.props.onSiteInfoReceived( result, () => {
								page( `/migrate/choose/${ this.props.targetSiteSlug }` );
							} );
						default:
							if ( window && window.history && window.history.pushState ) {
								/**
								 * Because query parameters aren't processed by `page.show`, we're forced to use `page.redirect`.
								 * Unfortunately, `page.redirect` breaks the back button behavior.
								 * This is a Work-around to push importUrl to history to fix the back button.
								 * See https://github.com/visionmedia/page.js#readme
								 */
								window.history.pushState( null, null, importUrl );
							}
							return page.redirect( importUrl );
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
					error={ this.state.error }
					targetSite={ targetSite }
					onUrlChange={ this.props.onUrlChange }
				/>
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
