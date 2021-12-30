import { NextButton } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import ActionCard from 'calypso/components/action-card';
import FormattedHeader from 'calypso/components/formatted-header';
import wpcom from 'calypso/lib/wp';
import { jetpack } from 'calypso/signup/icons';
import SelectItems from 'calypso/signup/select-items';

import './style.scss';
/* eslint-disable wpcalypso/jsx-classname-namespace */

interface Props {
	siteId: number;
	siteSlug: string;
	fromSite: string;
	onJetpackSelection: () => void;
	onContentOnlySelection: () => void;
	onContentEverythingSelection: () => void;
}
export type WPImportType = 'everything' | 'content_only';

export const ContentChooser: React.FunctionComponent< Props > = ( props ) => {
	const { __ } = useI18n();
	const {
		fromSite,
		onJetpackSelection,
		onContentOnlySelection,
		onContentEverythingSelection,
	} = props;

	/**
	 ↓ Fields
	 */
	const [ hasOriginSiteJetpackConnected, setHasOriginSiteJetpackConnected ] = useState( false );
	const [ isFetchingSite, setIsFetchingSite ] = useState( false );

	/**
	 ↓ Effects
	 */
	useEffect( checkOriginSiteJetpackConnection, [ fromSite ] );

	/**
	 ↓ Methods
	 */
	function checkOriginSiteJetpackConnection() {
		setIsFetchingSite( true );

		wpcom
			.site( fromSite )
			.get( { apiVersion: '1.2' } )
			.then( ( site: any ) => setHasOriginSiteJetpackConnected( site && site.jetpack_connection ) )
			.catch( () => setHasOriginSiteJetpackConnected( false ) )
			.finally( () => setIsFetchingSite( false ) );
	}

	return (
		<div className={ classnames( 'import-layout', 'content-chooser' ) }>
			<div className={ 'import-layout__column' }>
				<FormattedHeader
					align={ 'left' }
					headerText={ __( 'What would you like to import?' ) }
					subHeaderText={ __( 'Choose what you would like to import to your new site.' ) }
				/>
				<div className={ 'step-wrapper__header-image' }>
					<img alt="" src="/calypso/images/importer/onboarding-2.svg" />
				</div>
			</div>
			<div className={ 'import-layout__column' }>
				<div>
					<ActionCard
						classNames={ classnames( 'list__importer-option', {
							'is-disabled': ! hasOriginSiteJetpackConnected,
						} ) }
						headerText={ __( 'Everything' ) }
						mainText={ __( "All your site's content, themes, plugins, users and settings" ) }
					>
						<NextButton
							disabled={ ! hasOriginSiteJetpackConnected || isFetchingSite }
							onClick={ onContentEverythingSelection }
						>
							{ __( 'Continue' ) }
						</NextButton>
					</ActionCard>
					{ ! hasOriginSiteJetpackConnected && ! isFetchingSite && (
						<SelectItems
							onSelect={ onJetpackSelection }
							items={ [
								{
									key: 'jetpack',
									title: __( 'Jetpack required' ),
									description: __(
										'You need to have Jetpack installed on your site to be able to import everything.'
									),
									icon: jetpack,
									actionText: __( 'Install Jetpack' ),
									value: '',
								},
							] }
						/>
					) }
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

export default connect( () => {
	return {};
} )( ContentChooser );
