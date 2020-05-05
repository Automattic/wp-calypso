/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { Button, CompactCard } from '@automattic/components';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import CardHeading from 'components/card-heading';
import ImportTypeChoice from 'my-sites/migrate/components/import-type-choice';
import { get } from 'lodash';
import { getImportSectionLocation, redirectTo } from 'my-sites/migrate/helpers';
import SitesBlock from 'my-sites/migrate/components/sites-block';
import { recordTracksEvent } from 'state/analytics/actions';
import { FEATURE_UPLOAD_THEMES_PLUGINS } from 'lib/plans/constants';
import { planHasFeature } from 'lib/plans';

/**
 * Style dependencies
 */
import './section-migrate.scss';

class StepImportOrMigrate extends Component {
	static propTypes = {
		onJetpackSelect: PropTypes.func.isRequired,
		targetSite: PropTypes.object.isRequired,
		targetSiteSlug: PropTypes.string.isRequired,
	};

	state = {
		chosenImportType: null,
	};

	chooseImportType = ( type ) => {
		this.setState( { chosenImportType: type } );
	};

	onJetpackSelect = ( event ) => {
		const { isTargetSiteAtomic } = this.props;

		this.props.recordTracksEvent( 'calypso_importer_wordpress_select', {
			is_atomic: isTargetSiteAtomic,
			migration_type: 'migration',
		} );

		this.props.onJetpackSelect( event );
	};

	handleImportRedirect = () => {
		const { isTargetSiteAtomic, targetSiteSlug } = this.props;

		this.props.recordTracksEvent( 'calypso_importer_wordpress_select', {
			is_atomic: isTargetSiteAtomic,
			migration_type: 'content',
		} );

		const destinationURL = getImportSectionLocation( targetSiteSlug, isTargetSiteAtomic );

		if ( isTargetSiteAtomic ) {
			window.location.href = destinationURL;
		} else {
			redirectTo( destinationURL );
		}
	};

	isTargetSitePlanCompatible = () => {
		const { targetSite } = this.props;
		const planSlug = get( targetSite, 'plan.product_slug' );

		return planSlug && planHasFeature( planSlug, FEATURE_UPLOAD_THEMES_PLUGINS );
	};

	getJetpackOrUpgradeMessage = () => {
		const { sourceSiteInfo, sourceHasJetpack, isTargetSiteAtomic, translate } = this.props;

		if ( ! sourceHasJetpack ) {
			const sourceSiteDomain = get( sourceSiteInfo, 'site_url', '' );
			return (
				<p>
					{ translate(
						'You need to have Jetpack installed on your site to' +
							' be able to import everything.' +
							' {{jetpackInstallLink}}Install' +
							' Jetpack{{/jetpackInstallLink}}.',
						{
							components: {
								jetpackInstallLink: (
									<a href={ `https://wordpress.com/jetpack/connect/?url=${ sourceSiteDomain }` } />
								),
							},
						}
					) }
				</p>
			);
		}

		if ( ! isTargetSiteAtomic ) {
			return <p>{ translate( 'Import your entire site with the Business Plan.' ) }</p>;
		}
	};

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_importer_wordpress_type_viewed' );
	}

	render() {
		const {
			targetSite,
			targetSiteSlug,
			sourceHasJetpack,
			sourceSite,
			sourceSiteInfo,
			translate,
		} = this.props;
		const backHref = `/migrate/${ targetSiteSlug }`;

		const everythingLabels = [];
		if ( ! this.isTargetSitePlanCompatible() ) {
			everythingLabels.push( translate( 'Upgrade' ) );
		}

		return (
			<>
				<HeaderCake backHref={ backHref }>Import from WordPress</HeaderCake>

				<SitesBlock
					sourceSite={ sourceSite }
					sourceSiteInfo={ sourceSiteInfo }
					targetSite={ targetSite }
				/>

				<CompactCard>
					<CardHeading>{ translate( 'What do you want to import?' ) }</CardHeading>

					{ this.getJetpackOrUpgradeMessage() }
					<ImportTypeChoice
						onChange={ this.chooseImportType }
						radioOptions={ {
							everything: {
								title: translate( 'Everything' ),
								labels: everythingLabels,
								description: translate(
									"All your site's content, themes, plugins, users and settings"
								),
								enabled: sourceHasJetpack,
							},
							'content-only': {
								key: 'content-only',
								title: translate( 'Content only' ),
								description: translate( 'Import posts, pages, comments, and media.' ),
								enabled: true,
							},
						} }
					/>
					<div className="migrate__buttons-wrapper">
						{ this.state.chosenImportType === 'everything' ? (
							<Button primary onClick={ this.onJetpackSelect }>
								{ translate( 'Continue' ) }
							</Button>
						) : null }
						{ this.state.chosenImportType === 'content-only' ? (
							<Button primary onClick={ this.handleImportRedirect }>
								{ translate( 'Continue' ) }
							</Button>
						) : null }

						<Button className="migrate__cancel" href={ backHref }>
							{ translate( 'Cancel' ) }
						</Button>
					</div>
				</CompactCard>
			</>
		);
	}
}

export default connect( null, { recordTracksEvent } )( localize( StepImportOrMigrate ) );
