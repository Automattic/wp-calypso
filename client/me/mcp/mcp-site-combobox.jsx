import {
	ComboboxControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import SiteIcon from 'calypso/blocks/site-icon';
import { getSiteDisplayUrl } from '../../dashboard/utils/site-url';

/**
 * A ComboboxControl for picking a site, with site icon + name + URL rendering.
 *
 * @param {Object}   props
 * @param {Array}    props.options   - Array of { value: string, label: string, site: Object }
 * @param {string}   props.value
 * @param {Function} props.onChange
 * @param {boolean}  props.disabled
 * @param {string}   [props.label]
 */
export default function McpSiteCombobox( { options, value, onChange, disabled, label } ) {
	const translate = useTranslate();

	const renderItem = ( { item } ) => {
		const option = options.find( ( o ) => o.value === item.value );
		if ( ! option?.site ) {
			return item.label;
		}
		return (
			<HStack spacing={ 3 } alignment="left">
				<SiteIcon site={ option.site } size={ 32 } />
				<VStack spacing={ 0 }>
					<Text as="div" weight={ 500 } size={ 14 } lineHeight={ 1.5 } color="inherit">
						{ item.label }
					</Text>
					<Text as="div" size={ 12 } weight={ 400 } lineHeight={ 1.2 } color="inherit">
						{ getSiteDisplayUrl( option.site ) }
					</Text>
				</VStack>
			</HStack>
		);
	};

	return (
		<ComboboxControl
			__next40pxDefaultSize
			__nextHasNoMarginBottom
			label={ label ?? translate( 'Search for a site' ) }
			hideLabelFromVision
			value={ value }
			onChange={ onChange }
			options={ options.map( ( { value: v, label: l } ) => ( { value: v, label: l } ) ) }
			allowReset
			disabled={ disabled }
			placeholder={ translate( 'Search for a site…' ) }
			__experimentalRenderItem={ renderItem }
		/>
	);
}
