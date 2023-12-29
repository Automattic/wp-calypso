/**
 * External dependencies
 */
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import classnames from 'classnames';
import { useState } from 'react';
/**
 * Internal dependencies
 */
import LogoIcon from '../assets/icons/logo';
import MediaIcon from '../assets/icons/media';
import useLogo from '../hooks/use-logo';
import { saveToMediaLibrary } from '../lib/save-to-media-library';
import { ImageLoader } from './image-loader';
import './logo-presenter.scss';
/**
 * Types
 */
import type { Logo } from '../store/types';
import type React from 'react';

const SaveInLibraryButton: React.FC = () => {
	const [ saved, setSaved ] = useState( false );
	const [ saving, setSaving ] = useState( false );

	const {
		selectedLogo,
		site: { id },
	} = useLogo();

	return (
		<button
			className={ classnames( 'jetpack-ai-logo-generator-modal-presenter__action', {
				clickable: ! saved && ! saving,
			} ) }
			onClick={ async () => {
				if ( ! saving && ! saved ) {
					try {
						setSaving( true );

						await saveToMediaLibrary( {
							siteId: String( id ),
							url: selectedLogo.url,
							attrs: {
								alt: selectedLogo.description,
								caption: selectedLogo.description,
								description: selectedLogo.description,
								title: __( 'Site logo', 'jetpack' ),
							},
						} );
						setSaved( true );
					} catch ( error ) {
						// TODO: Handle error
					} finally {
						setSaving( false );
					}
				}
			} }
		>
			<Icon icon={ <MediaIcon /> } />
			{ saving && (
				<span className={ classnames( 'action-text', 'is-loading' ) }>
					{ __( 'Saving…', 'jetpack' ) }
				</span>
			) }
			{ ! saving && saved && <span className="action-text">{ __( 'Saved', 'jetpack' ) }</span> }
			{ ! saving && ! saved && (
				<span className="action-text">{ __( 'Save in Library', 'jetpack' ) }</span>
			) }
		</button>
	);
};

const UseOnSiteButton: React.FC = () => {
	return (
		<button
			className={ classnames( 'jetpack-ai-logo-generator-modal-presenter__action', 'clickable' ) }
		>
			<Icon icon={ <LogoIcon /> } />
			<span className="action-text">{ __( 'Use on Site', 'jetpack' ) }</span>
		</button>
	);
};

export const LogoPresenter: React.FC< { logo: Logo; loading?: boolean } > = ( {
	logo,
	loading = false,
} ) => {
	return (
		<div className="jetpack-ai-logo-generator-modal-presenter">
			<div className="jetpack-ai-logo-generator-modal-presenter__container">
				{ loading ? (
					<>
						<ImageLoader className="jetpack-ai-logo-generator-modal-presenter__logo" />
						<span className="jetpack-ai-logo-generator-modal-presenter__loading-text">
							{ __( 'Generating new logo…', 'jetpack' ) }
						</span>
					</>
				) : (
					<>
						<img
							src={ logo.url }
							alt={ logo.description }
							className="jetpack-ai-logo-generator-modal-presenter__logo"
						/>
						<div className="jetpack-ai-logo-generator-modal-presenter__action-wrapper">
							<span className="jetpack-ai-logo-generator-modal-presenter__description">
								{ logo.description }
							</span>
							<div className="jetpack-ai-logo-generator-modal-presenter__actions">
								<SaveInLibraryButton />
								<UseOnSiteButton />
							</div>
						</div>
					</>
				) }
			</div>
			<div className="jetpack-ai-logo-generator-modal-presenter__rectangle" />
		</div>
	);
};
