import { Button, Card, CompactCard } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import ScreenOptionsTab from 'calypso/components/screen-options-tab';
import SettingsSectionHeader from './settings-section-header';

import './style.scss';

const mockVersions = [
	{ name: 'Main', lastUpdated: 'Just now' },
	{ name: 'Yellow front page', lastUpdated: 'Three days ago' },
	{ name: 'Red front page', lastUpdated: 'Three weeks ago' },
];

const Version = ( { version, goBack } ) => {
	const currentVersion = mockVersions.at( version );

	return (
		<>
			<HeaderCake
				onClick={ goBack }
				actionButton={
					<Button compact primary>
						Merge to main
					</Button>
				}
			>
				<h1>Version: { currentVersion.name }</h1>
			</HeaderCake>
			<SettingsSectionHeader title="Settings" showButton />
			<Card style={ { paddingBottom: 0 } }>
				<span className="jetpack-module-toggle">
					<ToggleControl checked={ false } label={ 'Live version' } description />
					<FormSettingExplanation
						style={ { margin: '1.5em', marginTop: '-8px', marginLeft: '48px' } }
					>
						Make this version the one that is exposed to the world.
					</FormSettingExplanation>
				</span>
				<span className="jetpack-module-toggle">
					<ToggleControl checked={ false } label={ 'Current working draft' } />
					<FormSettingExplanation
						style={ { margin: '1.5em', marginTop: '-8px', marginLeft: '48px' } }
					>
						Any changes to the site will affect this version.
					</FormSettingExplanation>
				</span>
			</Card>
			<SettingsSectionHeader title="Preview" />
			<CompactCard
				className="site-tools__link"
				href="ok"
				target="_blank"
				style={ { display: 'flex', justifyContent: 'space-between', marginBottom: '16px' } }
			>
				<div className="site-tools__content">
					<a href="ok">https://mysite.wordpress.com/?version=ok</a>
					<p className="site-tools__section-desc">
						Through this link you can see the current state of this version. You can also share it
						so other people can see it in its current state.
					</p>
				</div>
			</CompactCard>
			<SettingsSectionHeader title="Compare with" />
			{ mockVersions.map( ( itVersion, index ) => {
				if ( index === version ) {
					return null;
				}

				return (
					<CompactCard href={ 'https://ok.com' } className="site-tools__link">
						<div className="site-tools__content">{ itVersion.name }</div>
					</CompactCard>
				);
			} ) }
		</>
	);
};

const liveVersion = mockVersions[ 0 ];

const SiteVersioning = ( { translate } ) => {
	const [ clickedVersion, setClickedVersion ] = useState( null );

	return (
		<Main>
			<ScreenOptionsTab wpAdminPath="options-versioning.php" />
			<DocumentHead title={ translate( 'Versioning' ) } />

			{ clickedVersion !== null ? (
				<Version version={ clickedVersion } goBack={ () => setClickedVersion( null ) } />
			) : (
				<>
					<FormattedHeader
						brandFont
						className="site-settings__page-heading"
						headerText={ translate( 'Versioning' ) }
						subHeaderText={ translate(
							'Switch between working versions of your site. You can also get preview links for unpublished versions.'
						) }
						align="left"
						hasScreenOptions
					/>
					<SettingsSectionHeader title="Live version" />
					<CompactCard href="ok" target="_blank" style={ { marginBottom: '16px' } }>
						<div className="site-tools__content">
							<FormSettingExplanation style={ { margin: 0, marginBottom: '12px' } }>
								This is the version that is accessible by everyone on the internet.
							</FormSettingExplanation>
							{ liveVersion.name }
							<p className="site-tools__section-desc">Last update: { liveVersion.lastUpdated }</p>
						</div>
					</CompactCard>
					<SettingsSectionHeader title="Working draft" />
					<CompactCard href="ok" target="_blank" style={ { marginBottom: '16px' } }>
						<FormSettingExplanation style={ { margin: 0, marginBottom: '12px' } }>
							Changes to the site will affect this version. It does not need to be the same as the
							live version if you want to make changes and don't have them visible immediately.
						</FormSettingExplanation>
						<div className="site-tools__content">
							{ liveVersion.name }
							<p className="site-tools__section-desc">Last update: { liveVersion.lastUpdated }</p>
						</div>
					</CompactCard>
					<SettingsSectionHeader title="Other versions">
						<Button compact primary>
							Create version
						</Button>
					</SettingsSectionHeader>
					{ mockVersions.slice( 1 ).map( ( version, index ) => {
						return (
							<CompactCard
								href="ok"
								onClick={ ( e ) => {
									e.preventDefault();
									setClickedVersion( index + 1 );
								} }
								className="site-tools__link"
								style={ { display: 'flex', justifyContent: 'space-between' } }
							>
								<div className="site-tools__content">
									{ version.name }
									<p className="site-tools__section-desc">Last update: { version.lastUpdated }</p>
								</div>
							</CompactCard>
						);
					} ) }
				</>
			) }
		</Main>
	);
};

SiteVersioning.propTypes = {
	// Connected props
	siteId: PropTypes.number,
};

export default localize( SiteVersioning );
