import { NextButton, SelectItems } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import illustrationImg from 'calypso/assets/images/onboarding/import-2.svg';
import ActionCard from 'calypso/components/action-card';
import FormattedHeader from 'calypso/components/formatted-header';
import { preventWidows } from 'calypso/lib/formatting';
import wpcom from 'calypso/lib/wp';
import { jetpack } from 'calypso/signup/icons';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { requestSite } from 'calypso/state/sites/actions';

import './style.scss';
/* eslint-disable wpcalypso/jsx-classname-namespace */

const trackEventName = 'calypso_signup_actions_submit_step';
const trackEventParams = {
	intent: 'import',
	step: 'importReadyPreview',
};

interface Props {
	siteId: number;
	siteSlug: string;
	fromSite: string;
	onJetpackSelection: () => void;
	onContentOnlySelection: () => void;
	onContentEverythingSelection: () => void;
}

interface MigrationEnabled {
	source_blog_id: number;
	jetpack_activated: boolean;
	jetpack_compatible: boolean;
	migration_activated: boolean;
	migration_compatible: boolean;
}

export const ContentChooser: React.FunctionComponent< Props > = ( props ) => {
	const { __ } = useI18n();
	const dispatch = useDispatch();
	const {
		fromSite,
		siteId,
		onJetpackSelection,
		onContentOnlySelection,
		onContentEverythingSelection,
	} = props;

	/**
	 ↓ Fields
	 */
	const showJetpackConnectionBlock = !! fromSite;
	const [ hasOriginSiteJetpackConnected, setHasOriginSiteJetpackConnected ] = useState( false );
	const [ initialFetching, setInitialFetching ] = useState( true );
	const firstRun = useRef( true );

	/**
	 ↓ Effects
	 */
	useEffect( () => {
		checkOriginSiteJetpackConnection();
		const interval = setInterval( checkOriginSiteJetpackConnection, 5000 );

		return () => clearInterval( interval );
	}, [] );

	useEffect( () => {
		if ( firstRun.current ) {
			firstRun.current = false;
			return;
		}

		dispatch( requestSite( fromSite ) );
	}, [ hasOriginSiteJetpackConnected ] );

	useEffect( () => {
		dispatch( recordTracksEvent( trackEventName, trackEventParams ) );
	}, [] );

	/**
	 ↓ Methods
	 */
	function checkOriginSiteJetpackConnection() {
		if ( ! fromSite ) {
			return;
		}

		/* wpcom
			.site( fromSite )
			.get( { apiVersion: '1.2' } )
			.then( ( site: SiteDetails ) =>
				setHasOriginSiteJetpackConnected( !! ( site && site.capabilities ) )
			)
			.catch( () => setHasOriginSiteJetpackConnected( false ) )
			.finally( () => setInitialFetching( false ) ); */
		wpcom.req
			.get( {
				apiNamespace: 'wpcom/v2/',
				path: `sites/${ siteId }/migration-enabled/${ encodeURIComponent( fromSite ) }`,
			} )
			.then( ( enabled: MigrationEnabled ) => {
				setHasOriginSiteJetpackConnected( enabled.jetpack_compatible );
			} )
			.catch( () => setHasOriginSiteJetpackConnected( false ) )
			.finally( () => setInitialFetching( false ) );
	}

	return (
		<div className={ classnames( 'import-layout', 'content-chooser' ) }>
			<div className="import-layout__column">
				<FormattedHeader
					align="left"
					headerText={ __( 'What would you like to import?' ) }
					subHeaderText={ __( 'Choose what you would like to import to your new site.' ) }
				/>
				<div className="step-wrapper__header-image">
					<img alt="Import" src={ illustrationImg } aria-hidden="true" />
				</div>
			</div>
			<div className="import-layout__column">
				<div>
					<ActionCard
						classNames={ classnames( 'list__importer-option', {
							'is-disabled': ! hasOriginSiteJetpackConnected,
						} ) }
						headerText={ __( 'Everything' ) }
						mainText={ __( "All your site's content, themes, plugins, users and settings" ) }
					>
						<NextButton
							disabled={ ! hasOriginSiteJetpackConnected || initialFetching }
							onClick={ onContentEverythingSelection }
						>
							{ __( 'Continue' ) }
						</NextButton>
					</ActionCard>
					{ showJetpackConnectionBlock && ! hasOriginSiteJetpackConnected && ! initialFetching && (
						<SelectItems
							onSelect={ onJetpackSelection }
							items={ [
								{
									key: 'jetpack',
									title: __( 'Jetpack required' ),
									description: (
										<p>
											{ __(
												'You need to have Jetpack installed on your site to be able to import everything.'
											) }
										</p>
									),
									icon: jetpack,
									actionText: __( 'Install Jetpack' ),
									value: '',
								},
							] }
							preventWidows={ preventWidows }
						/>
					) }
					<hr />
					<ActionCard
						classNames={ classnames( 'list__importer-option', { 'is-disabled': false } ) }
						headerText={ __( 'Content only' ) }
						mainText={ __( 'Import posts, pages, comments, and media.' ) }
					>
						<NextButton onClick={ onContentOnlySelection }>{ __( 'Continue' ) }</NextButton>
					</ActionCard>
				</div>
			</div>
		</div>
	);
};

export default ContentChooser;
