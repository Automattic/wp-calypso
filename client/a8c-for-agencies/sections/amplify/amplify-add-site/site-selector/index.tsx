import {
	ComboboxControl,
	Disabled,
	TextControl,
	__experimentalText as Text,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { isValidUrl } from 'calypso/a8c-for-agencies/components/form/utils';
import { addSchemeIfMissing } from 'calypso/lib/url';
import useConnectableSites from './use-connectable-sites';

/**
 * Normalize a user-typed URL: validate it looks like an http(s) site and add a
 * default `https://` scheme when none is given. Returns `null` when the input
 * isn't a plausible URL.
 */
function normalizeUrl( raw: string ): string | null {
	const trimmed = raw.trim();
	return isValidUrl( trimmed ) ? addSchemeIfMissing( trimmed, 'https' ) : null;
}

type InputSource = 'site' | 'url';

type Props = {
	/**
	 * Called with the resolved target URL — the picked connected-site URL or the
	 * normalized typed URL — or an empty string when nothing valid is selected.
	 * Memoize in the parent to keep it stable.
	 */
	onChange: ( url: string ) => void;
	disabled?: boolean;
};

/**
 * Lets the user pick a connected site or enter a URL. A toggle switches between
 * the two sources so only one field is shown at a time (connected site by
 * default). Reusable across the analysis modal and the overview hero; the
 * parent owns the submit action and reads the resolved URL via `onChange`.
 */
export default function AmplifySiteSelector( { onChange, disabled }: Props ) {
	const [ source, setSource ] = useState< InputSource >( 'site' );
	const [ urlInput, setUrlInput ] = useState( '' );
	const [ selectedSiteUrl, setSelectedSiteUrl ] = useState< string | null >( null );

	const { sites, isLoading } = useConnectableSites();

	const options = useMemo(
		() => sites.map( ( site ) => ( { label: site.url, value: site.url } ) ),
		[ sites ]
	);

	// Report the resolved target for whichever source is currently active, so
	// a value left in the hidden field never leaks into the submission.
	const report = ( nextSource: InputSource, url: string, site: string | null ) => {
		onChange( nextSource === 'url' ? normalizeUrl( url ) ?? '' : site ?? '' );
	};

	const handleSourceChange = ( value: string | number | undefined ) => {
		const next = ( value as InputSource ) ?? 'site';
		setSource( next );
		report( next, urlInput, selectedSiteUrl );
	};

	const handleUrlChange = ( next: string ) => {
		setUrlInput( next );
		report( 'url', next, selectedSiteUrl );
	};

	const handleSiteChange = ( next: string | null | undefined ) => {
		const nextSite = next ?? null;
		setSelectedSiteUrl( nextSite );
		report( 'site', urlInput, nextSite );
	};

	return (
		<VStack spacing={ 3 }>
			<Text weight={ 500 }>{ __( 'Select a site or enter a URL' ) }</Text>
			<ToggleGroupControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				isBlock
				hideLabelFromVision
				label={ __( 'Site source' ) }
				value={ source }
				onChange={ handleSourceChange }
			>
				<ToggleGroupControlOption value="site" label={ __( 'Connected site' ) } />
				<ToggleGroupControlOption value="url" label={ __( 'Enter a URL' ) } />
			</ToggleGroupControl>

			{ source === 'site' ? (
				<Disabled isDisabled={ disabled }>
					<ComboboxControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Pick a connected site' ) }
						hideLabelFromVision
						value={ selectedSiteUrl }
						options={ options }
						onChange={ handleSiteChange }
						placeholder={ isLoading ? __( 'Loading sites…' ) : __( 'Choose a site' ) }
					/>
				</Disabled>
			) : (
				<TextControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Enter a URL' ) }
					hideLabelFromVision
					type="text"
					inputMode="url"
					value={ urlInput }
					onChange={ handleUrlChange }
					placeholder="https://example.com"
					disabled={ disabled }
					autoComplete="off"
					autoCorrect="off"
					spellCheck={ false }
				/>
			) }
		</VStack>
	);
}
