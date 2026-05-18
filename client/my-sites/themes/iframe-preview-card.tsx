import { Spinner } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useId, useRef, useState } from 'react';
import FormRadio from 'calypso/components/forms/form-radio';

import './iframe-preview-card.scss';

interface IframePreviewCardProps {
	name: string;
	value: string;
	isSelected: boolean;
	onSelect: ( value: string ) => void;
	label: string;
	// Short, user-facing name for the option (e.g. "Basic setup"). Used in the
	// "Enter preview" button label so keyboard users know which option's iframe
	// they're entering.
	optionName: string;
	iframeUrl: string;
	iframeTitle: string;
	caption: string;
	className?: string;
	disabled?: boolean;
}

const IframePreviewCard = ( {
	name,
	value,
	isSelected,
	onSelect,
	label,
	optionName,
	iframeUrl,
	iframeTitle,
	caption,
	className,
	disabled = false,
}: IframePreviewCardProps ) => {
	const translate = useTranslate();
	const radioId = useId();
	const iframeRef = useRef< HTMLIFrameElement | null >( null );
	const [ isLoaded, setIsLoaded ] = useState( false );

	const handleEnterPreview = ( event: React.MouseEvent | React.KeyboardEvent ) => {
		// Don't bubble to the wrapping <label> — pressing Enter / Space on the
		// "Enter preview" button shouldn't also flip the radio.
		event.preventDefault();
		event.stopPropagation();
		iframeRef.current?.contentWindow?.focus();
	};

	return (
		<label
			htmlFor={ radioId }
			className={ clsx(
				'iframe-preview-card',
				{ 'is-selected': isSelected, 'is-disabled': disabled },
				className
			) }
		>
			<span className="iframe-preview-card__frame-wrapper">
				{ ! isLoaded && (
					<span className="iframe-preview-card__loading" aria-hidden="true">
						<Spinner size={ 50 } />
					</span>
				) }
				<iframe
					ref={ iframeRef }
					loading="lazy"
					title={ iframeTitle }
					src={ iframeUrl }
					tabIndex={ -1 }
					className="iframe-preview-card__iframe"
					onLoad={ () => setIsLoaded( true ) }
					style={ { opacity: isLoaded ? 1 : 0 } }
				/>
				{ /*
					Visually-hidden-until-focused button that lets keyboard users
					opt into the iframe's content tab order. Mirrors the
					"Skip to main content" pattern used in
					client/jetpack-cloud/sections/pricing/jpcom-masterbar/.
				*/ }
				<button
					type="button"
					className="iframe-preview-card__enter-preview"
					onClick={ handleEnterPreview }
					disabled={ disabled }
				>
					{ translate( 'Enter preview for the "%(optionName)s" option', {
						args: { optionName },
					} ) }
				</button>
			</span>
			<span className="iframe-preview-card__caption-row">
				<FormRadio
					id={ radioId }
					name={ name }
					value={ value }
					checked={ isSelected }
					onChange={ () => onSelect( value ) }
					aria-label={ label }
					className="iframe-preview-card__radio"
					disabled={ disabled }
				/>
				<span className="iframe-preview-card__caption">{ caption }</span>
			</span>
		</label>
	);
};

export default IframePreviewCard;
