import { Modal } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import AdPreview from 'calypso/my-sites/promote-post-i2/components/ad-preview';

type Device = 'mobile' | 'tablet' | 'desktop';
export type BannerWidth = '300px' | '500px' | '650px' | '100%';

type Props = {
	templateFormat?: string | undefined;
	isLoading?: boolean;
	htmlCode?: string | undefined;
};

const AdPreviewModal: React.FC< Props > = ( { templateFormat, htmlCode, isLoading } ) => {
	const [ isOpen, setOpen ] = useState( false );
	const openModal = () => setOpen( true );
	const closeModal = () => setOpen( false );

	const [ previewSelected, setPreviewSelected ] = useState< Device >( 'mobile' );

	const MobileIcon = () => {
		return (
			<svg width="18px" height="18px" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
				<path d="M9.8,12.3H8.2v1.2h1.7V12.3z" />
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M4.8,4c0-0.9,0.7-1.7,1.7-1.7h5c0.9,0,1.7,0.7,1.7,1.7v10c0,0.9-0.7,1.7-1.7,1.7h-5c-0.9,0-1.7-0.7-1.7-1.7V4z M6.5,3.6h5c0.2,0,0.4,0.2,0.4,0.4v10c0,0.2-0.2,0.4-0.4,0.4h-5c-0.2,0-0.4-0.2-0.4-0.4V4C6.1,3.8,6.3,3.6,6.5,3.6z"
				/>
			</svg>
		);
	};

	const TabletIcon = () => {
		return (
			<svg width="18px" height="18px" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
				<path d="M10.7,12.3H7.3v1.2h3.3V12.3z" />
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M3.2,4c0-0.9,0.7-1.7,1.7-1.7h8.3c0.9,0,1.7,0.7,1.7,1.7v10c0,0.9-0.7,1.7-1.7,1.7H4.8c-0.9,0-1.7-0.7-1.7-1.7 V4z M4.8,3.6h8.3c0.2,0,0.4,0.2,0.4,0.4v10c0,0.2-0.2,0.4-0.4,0.4H4.8c-0.2,0-0.4-0.2-0.4-0.4V4C4.4,3.8,4.6,3.6,4.8,3.6z"
				/>
			</svg>
		);
	};

	const DesktopIcon = () => {
		return (
			<svg width="18px" height="18px" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M2.5,5.9c0-0.9,0.7-1.7,1.7-1.7h9.6c0.9,0,1.7,0.7,1.7,1.7v6.7h0.6c0.7,0,1.2,0.6,1.2,1.2H0.7	c0-0.7,0.6-1.2,1.2-1.2h0.6V5.9z M4.2,5.5h9.6c0.2,0,0.4,0.2,0.4,0.4v6.3H3.8V5.9C3.8,5.6,4,5.5,4.2,5.5z"
				/>
			</svg>
		);
	};

	function showMobilePreview() {
		setPreviewSelected( 'mobile' );
	}

	function showTabletPreview() {
		setPreviewSelected( 'tablet' );
	}

	function showDesktopPreview() {
		setPreviewSelected( 'desktop' );
	}

	function getPreviewWidth( device: Device ): BannerWidth {
		switch ( device ) {
			case 'mobile':
				return '300px';
			case 'tablet':
				return '500px';
			case 'desktop':
				return '650px';
		}
	}

	const PreviewIcon = () => {
		return (
			<svg
				width="20"
				height="20"
				viewBox="0 0 20 20"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				className="ad-preview-icon"
			>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M3.33301 16.666L3.33301 3.33268L4.58301 3.33268L4.58301 16.666L3.33301 16.666ZM7.91634 4.99935L7.91634 14.9993C7.91634 15.2295 8.10289 15.416 8.33301 15.416L11.6663 15.416C11.8965 15.416 12.083 15.2295 12.083 14.9993L12.083 4.99935C12.083 4.76923 11.8965 4.58268 11.6663 4.58268L8.33301 4.58268C8.10289 4.58268 7.91634 4.76923 7.91634 4.99935ZM6.66634 14.9993L6.66634 4.99935C6.66634 4.07887 7.41253 3.33268 8.33301 3.33268L11.6663 3.33268C12.5868 3.33268 13.333 4.07887 13.333 4.99935L13.333 14.9993C13.333 15.9198 12.5868 16.666 11.6663 16.666L8.33301 16.666C7.41253 16.666 6.66634 15.9198 6.66634 14.9993ZM15.4163 3.33268L15.4163 16.666L16.6663 16.666L16.6663 3.33268L15.4163 3.33268Z"
				/>
			</svg>
		);
	};

	return (
		<>
			<button onClick={ openModal }>
				<PreviewIcon />
				<span>{ __( 'Preview' ) }</span>
			</button>
			{ isOpen && (
				<Modal className="ad-preview-modal" title="Ad Preview" onRequestClose={ closeModal }>
					<div className="ad-preview-modal__creatives">
						<AdPreview
							isLoading={ isLoading }
							htmlCode={ htmlCode || '' }
							templateFormat={ templateFormat || '' }
							width={ getPreviewWidth( previewSelected ) }
						/>
					</div>
					<div className="ad-preview-modal__links">
						<button
							onClick={ showMobilePreview }
							color="inherit"
							rel="noreferrer"
							className={ clsx( 'link-preview', previewSelected === 'mobile' ? 'active' : '' ) }
						>
							<MobileIcon />
							<span>{ __( 'Mobile' ) }</span>
						</button>

						<button
							onClick={ showTabletPreview }
							color="inherit"
							rel="noreferrer"
							className={ clsx( 'link-preview', previewSelected === 'tablet' ? 'active' : '' ) }
						>
							<TabletIcon />
							<span>{ __( 'Tablet' ) }</span>
						</button>

						<button
							onClick={ showDesktopPreview }
							color="inherit"
							rel="noreferrer"
							className={ clsx( 'link-preview', previewSelected === 'desktop' ? 'active' : '' ) }
						>
							<DesktopIcon />
							<span>{ __( 'Desktop' ) }</span>
						</button>
					</div>
				</Modal>
			) }
		</>
	);
};

export default AdPreviewModal;
