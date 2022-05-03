import { Button, Gridicon, HappinessEngineersTray } from '@automattic/components';
import { SitePickerDropDown } from '@automattic/site-picker';
import { TextareaControl, TextControl, CheckboxControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';

export const SITE_STORE = 'automattic/site';

const SitePicker = ( { selectedSiteId, onSetSelectedSiteId } ) => {
	const site = useSelect( ( select ) => select( SITE_STORE ).getSite( window._currentSiteId ) );

	const otherSite = {
		name: __( 'Other site', 'full-site-editing' ),
		ID: 0,
		logo: {},
	};

	function pickSite( ID ) {
		onSetSelectedSiteId( ID );
	}

	const options = [ site, otherSite ];

	return (
		<SitePickerDropDown
			onPickSite={ pickSite }
			options={ options }
			selectedSiteId={ selectedSiteId }
		/>
	);
};

const titles = {
	CHAT: {
		formTitle: __( 'Start live chat', 'full-site-editing' ),
		trayText: __( 'Our WordPress experts will be with you right away', 'full-site-editing' ),
		buttonLabel: __( 'Chat with us', 'full-site-editing' ),
	},
	EMAIL: {
		formTitle: __( 'Send us an email', 'full-site-editing' ),
		trayText: __( 'Our WordPress experts will get back to you soon', 'full-site-editing' ),
		buttonLabel: __( 'Email us', 'full-site-editing' ),
	},
	FORUM: {
		formTitle: __( 'Ask in our community forums', 'full-site-editing' ),
		formDisclaimer: __(
			'Please do not provide financial or contact information when submitting this form.',
			'full-site-editing'
		),
		buttonLabel: __( 'Ask in the forums', 'full-site-editing' ),
	},
};

export default function ContactForm( { mode } ) {
	const [ selectedSiteId, setSelectedSiteId ] = useState();

	const formTitles = titles[ mode ];

	return (
		<main className="help-center__contact-form">
			<header>
				<Button borderless={ true }>
					<Gridicon icon={ 'chevron-left' } size={ 18 } />
					{ __( 'Back', 'full-site-editing' ) }
				</Button>
			</header>
			<h1 className="site-picker-title">{ formTitles.formTitle }</h1>
			{ formTitles.formDisclaimer && (
				<p className="site-picker-form-warning">{ formTitles.formDisclaimer }</p>
			) }
			<section>
				<SitePicker selectedSiteId={ selectedSiteId } onSetSelectedSiteId={ setSelectedSiteId } />
			</section>
			{ selectedSiteId === 0 && (
				<section>
					<TextControl label={ __( 'Site address', 'full-site-editing' ) } />
				</section>
			) }

			{ [ 'FORUM', 'EMAIL' ].includes( mode ) && (
				<section>
					<TextControl label={ __( 'Subject', 'full-site-editing' ) } />
				</section>
			) }

			<section>
				<TextareaControl
					rows="10"
					label={ __( 'How can we help you today?', 'full-site-editing' ) }
				/>
			</section>

			{ mode === 'FORUM' && (
				<section>
					<CheckboxControl
						checked
						label={ __( 'Don’t display my site’s URL publicly', 'full-site-editing' ) }
					/>
				</section>
			) }
			<section>
				<Button primary className="site-picker__cta">
					{ formTitles.buttonLabel }
				</Button>
			</section>
			{ [ 'CHAT', 'EMAIL' ].includes( mode ) && (
				<section>
					<div className="site-picker__hes-tray">
						<HappinessEngineersTray count={ 2 } />
						<p className="site-picker__hes-tray-text">{ formTitles.trayText }</p>
					</div>
				</section>
			) }
		</main>
	);
}
