import './style.scss';

import {
	Button,
	CheckboxControl,
	RadioControl,
	ToggleControl,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { applyReplyAllowRadio, toggleComboFlag, type ComboFlag, type ReplyAllow } from './state';

interface Props {
	initialReplyAllow: ReplyAllow;
	initialAllowQuotes: boolean;
	onSave: ( replyAllow: ReplyAllow, allowQuotes: boolean ) => void;
	headingId?: string;
}

export function AtmosphereInteractionSettings( {
	initialReplyAllow,
	initialAllowQuotes,
	onSave,
	headingId,
}: Props ) {
	const translate = useTranslate();
	const [ replyAllow, setReplyAllow ] = useState< ReplyAllow >( initialReplyAllow );
	const [ allowQuotes, setAllowQuotes ] = useState( initialAllowQuotes );

	const isNobody = replyAllow.kind === 'nobody';
	const isCombo = replyAllow.kind === 'combo';

	const comboValue = ( flag: ComboFlag ): boolean => ( isCombo ? replyAllow[ flag ] : false );

	const handleComboChange = ( flag: ComboFlag ) => ( checked: boolean ) => {
		setReplyAllow( ( current ) => toggleComboFlag( current, flag, checked ) );
	};

	// Leave the radio unselected while combo flags are active so the popover
	// doesn't claim "Anyone" is the answer when restrictions are also on.
	let radioValue: 'anyone' | 'nobody' | undefined;
	if ( isNobody ) {
		radioValue = 'nobody';
	} else if ( ! isCombo ) {
		radioValue = 'anyone';
	}

	return (
		<VStack spacing={ 4 } className="atmosphere-interaction-settings">
			<h2 id={ headingId } className="atmosphere-interaction-settings__heading">
				{ translate( 'Post interaction settings' ) }
			</h2>

			<RadioControl
				label={ String( translate( 'Who can reply' ) ) }
				selected={ radioValue }
				options={ [
					{ label: String( translate( 'Anyone' ) ), value: 'anyone' },
					{ label: String( translate( 'Nobody' ) ), value: 'nobody' },
				] }
				onChange={ ( next ) => {
					if ( next === 'anyone' || next === 'nobody' ) {
						setReplyAllow( applyReplyAllowRadio( next ) );
					}
				} }
			/>

			<CheckboxControl
				__nextHasNoMarginBottom
				label={ String( translate( 'Your followers' ) ) }
				checked={ comboValue( 'follower' ) }
				disabled={ isNobody }
				onChange={ handleComboChange( 'follower' ) }
			/>
			<CheckboxControl
				__nextHasNoMarginBottom
				label={ String( translate( 'People you follow' ) ) }
				checked={ comboValue( 'following' ) }
				disabled={ isNobody }
				onChange={ handleComboChange( 'following' ) }
			/>
			<CheckboxControl
				__nextHasNoMarginBottom
				label={ String( translate( 'People you mention' ) ) }
				checked={ comboValue( 'mention' ) }
				disabled={ isNobody }
				onChange={ handleComboChange( 'mention' ) }
			/>

			<ToggleControl
				__nextHasNoMarginBottom
				label={ String( translate( 'Allow quote posts' ) ) }
				checked={ allowQuotes }
				onChange={ setAllowQuotes }
			/>

			<Button
				variant="primary"
				className="atmosphere-interaction-settings__save"
				onClick={ () => onSave( replyAllow, allowQuotes ) }
			>
				{ translate( 'Save' ) }
			</Button>
		</VStack>
	);
}
