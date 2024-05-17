import page from '@automattic/calypso-router';
import { Button, Card, CompactCard } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import HeaderCake from 'calypso/components/header-cake';
import Notice from 'calypso/components/notice';
import wpcom from 'calypso/lib/wp';
import SitesBlock from 'calypso/my-sites/migrate/components/sites-block';
import {
	getImportSectionLocation,
	redirectTo,
	triggerMigrationStartingEvent,
} from 'calypso/my-sites/migrate/helpers';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import './section-migrate.scss';

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

	onUrlChange = ( args ) => {
		this.setState( { error: null } );
		this.props.onUrlChange( args );
	};

	handleContinue = () => {
		const {
			translate,
			targetSite: { jetpack: isJetpackSite },
		} = this.props;

		if ( this.state.isLoading ) {
			return;
		}

		const validEngines = [ 'wordpress', 'blogger', 'medium', 'wix', 'godaddy', 'squarespace' ];

		this.setState( { error: null, isLoading: true }, () => {
			wpcom.req
				.get(
					{ path: '/imports/is-site-importable', apiNamespace: 'wpcom/v2' },
					{ site_url: this.props.url }
				)
				.then( ( result ) => {
					const importUrl = `/import/${ this.props.targetSiteSlug }?not-wp=1&engine=${ result.site_engine }&from-site=${ result.site_url }`;

					this.props.recordTracksEvent( 'calypso_importer_wordpress_enter_url', {
						url: result.site_url,
						engine: result.site_engine,
						has_jetpack: !! get( result, 'site_meta.jetpack_version', false ),
						jetpack_version: get( result, 'site_meta.jetpack_version', 'no jetpack' ),
						is_wpcom: get( result, 'site_meta.wpcom_site', false ),
					} );

					switch ( result.site_engine ) {
						case 'wordpress':
							if ( result.site_meta.wpcom_site ) {
								return this.setState( {
									error: translate( 'This site is already hosted on WordPress.com' ),
									isLoading: false,
								} );
							}

							return this.props.onSiteInfoReceived( result, () => {
								page( `/migrate/choose/${ this.props.targetSiteSlug }` );
							} );
						default:
							if ( validEngines.indexOf( result.site_engine ) === -1 || isJetpackSite ) {
								return this.setState( {
									error: translate( 'This is not a WordPress site' ),
									isLoading: false,
								} );
							}

							return redirectTo( importUrl );
					}
				} )
				.catch( ( error ) => {
					switch ( error.code ) {
						case 'rest_invalid_param':
							return this.setState( {
								error: translate(
									"We couldn't reach that site. Please check the URL and try again."
								),
								isLoading: false,
							} );
						default:
							return this.setState( {
								error: translate( 'Something went wrong. Please check the URL and try again.' ),
								isLoading: false,
							} );
					}
				} );
		} );
	};

	componentDidMount() {
		const { user } = this.props;
		this.props.recordTracksEvent( 'calypso_importer_wordpress_source_select_viewed' );

		if ( user && user.ID ) {
			const migrationFlow = 'in-product';
			triggerMigrationStartingEvent( user, migrationFlow );
		}
	}

	render() {
		const { targetSite, targetSiteSlug, translate } = this.props;
		const backHref = `/import/${ targetSiteSlug }`;
		const uploadFileLink = getImportSectionLocation( targetSiteSlug, targetSite.jetpack );

		return (
			<>
				<HeaderCake backHref={ backHref }>{ translate( 'Import from WordPress' ) }</HeaderCake>

				{ this.state.error && (
					<Notice className="migrate__error" showDismiss={ false } status="is-error">
						{ this.state.error }
					</Notice>
				) }

				<CompactCard>
					<CardHeading>{ translate( 'What WordPress site do you want to import?' ) }</CardHeading>
					<div className="migrate__explain">
						{ translate(
							"Enter a URL and we'll help you move your site to WordPress.com. If you already have a " +
								'WordPress export file, you can' +
								' {{uploadFileLink}}upload it to import content{{/uploadFileLink}}.',
							{
								components: {
									uploadFileLink: <a className="migrate__import-link" href={ uploadFileLink } />,
								},
							}
						) }
					</div>
				</CompactCard>
				<SitesBlock
					sourceSite={ null }
					loadingSourceSite={ this.state.isLoading }
					targetSite={ targetSite }
					onUrlChange={ this.onUrlChange }
					onSubmit={ this.handleContinue }
					url={ this.props.url }
					step="sourceSelect"
				/>

				<Card>
					<Button busy={ this.state.isLoading } onClick={ this.handleContinue } primary>
						{ translate( 'Continue' ) }
					</Button>
				</Card>
			</>
		);
	}
}
export default connect(
	( state ) => ( {
		user: getCurrentUser( state ) || {},
	} ),
	{ recordTracksEvent }
)( localize( StepSourceSelect ) );
