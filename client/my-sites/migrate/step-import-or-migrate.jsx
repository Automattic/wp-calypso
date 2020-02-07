/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { Button, CompactCard } from '@automattic/components';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import CardHeading from 'components/card-heading';

/**
 * Style dependencies
 */
import './section-migrate.scss';
import ImportTypeChoice from 'my-sites/migrate/components/import-type-choice';
import { get } from 'lodash';
import { redirectTo } from 'my-sites/migrate/helpers';
import SitesBlock from 'my-sites/migrate/components/sites-block';

class StepImportOrMigrate extends Component {
	static propTypes = {
		onJetpackSelect: PropTypes.func.isRequired,
		targetSite: PropTypes.object.isRequired,
		targetSiteSlug: PropTypes.string.isRequired,
	};

	state = {
		chosenImportType: null,
	};

	chooseImportType = type => {
		this.setState( { chosenImportType: type } );
	};

	handleImportRedirect = () => {
		const { isTargetSiteAtomic, targetSiteSlug } = this.props;

		if ( isTargetSiteAtomic ) {
			window.location.href = `https://${ targetSiteSlug }/wp-admin/import.php`;
		} else {
			redirectTo( `/import/${ targetSiteSlug }/?engine=wordpress` );
		}
	};

	getJetpackOrUpgradeMessage = () => {
		const { sourceSite, sourceHasJetpack, isTargetSiteAtomic } = this.props;

		if ( ! sourceHasJetpack ) {
			const sourceSiteDomain = get( sourceSite, 'domain' );
			return (
				<p>
					You need to have{ ' ' }
					<a href={ `https://wordpress.com/jetpack/connect/install?url=${ sourceSiteDomain }` }>
						Jetpack
					</a>{ ' ' }
					installed on your site to be able to import everything.
				</p>
			);
		}

		if ( ! isTargetSiteAtomic ) {
			return <p>Import your entire site with the Business Plan.</p>;
		}
	};

	render() {
		const { targetSite, targetSiteSlug, sourceHasJetpack, sourceSite, sourceSiteInfo } = this.props;
		const backHref = `/migrate/${ targetSiteSlug }`;

		return (
			<>
				<HeaderCake backHref={ backHref }>Import from WordPress</HeaderCake>

				<SitesBlock
					sourceSite={ sourceSite }
					sourceSiteInfo={ sourceSiteInfo }
					targetSite={ targetSite }
				/>

				<CompactCard>
					<CardHeading>What do you want to import?</CardHeading>

					{ this.getJetpackOrUpgradeMessage() }
					<ImportTypeChoice
						onChange={ this.chooseImportType }
						radioOptions={ {
							everything: {
								title: 'Everything',
								labels: [ 'Upgrade' ],
								description: "All your site's content, themes, plugins, users and settings",
								enabled: sourceHasJetpack,
							},
							'content-only': {
								key: 'content-only',
								title: 'Content only',
								description: 'Import posts, pages, comments, and media.',
								enabled: true,
							},
						} }
					/>
					<div className="migrate__buttons-wrapper">
						{ this.state.chosenImportType === 'everything' ? (
							<Button primary onClick={ this.props.onJetpackSelect }>
								Continue
							</Button>
						) : null }
						{ this.state.chosenImportType === 'content-only' ? (
							<Button primary onClick={ this.handleImportRedirect }>
								Continue
							</Button>
						) : null }

						<Button className="migrate__cancel" href={ backHref }>
							Cancel
						</Button>
					</div>
				</CompactCard>
			</>
		);
	}
}

export default localize( StepImportOrMigrate );
