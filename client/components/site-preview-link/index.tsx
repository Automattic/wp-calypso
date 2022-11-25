import styled from '@emotion/styled';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import ClipboardButtonInput from '../clipboard-button-input';

const HelpText = styled.p( {
	display: 'block',
	margin: '5px 0',
	fontSize: '0.875rem',
	fontStyle: 'italic',
	fontWeight: 400,
	color: 'var(--color-text-subtle)',
} );

export default function SitePreviewLink( { disabled = false } ) {
	const translate = useTranslate();
	const [ checked, setChecked ] = useState( false );
	const [ loading ] = useState( false );
	function onChange( value: boolean ) {
		setChecked( value );
	}
	const checkedAndNotDisabled = checked && ! disabled;
	return (
		<div>
			<ToggleControl
				label={ translate( 'Create a preview link.' ) }
				checked={ checkedAndNotDisabled }
				onChange={ onChange }
				{ ...{ disabled: disabled || loading } } // disabled is not included on ToggleControl props type
			/>
			<HelpText>{ translate( 'Anyone with this link can view your site.' ) }</HelpText>
			{ checkedAndNotDisabled && (
				<ClipboardButtonInput
					value="https://mysite.wordpress.com?preview=12kabe45cdp"
					hideHttp
					disabled={ loading }
				/>
			) }
		</div>
	);
}
