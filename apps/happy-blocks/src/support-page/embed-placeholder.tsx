import { Button, Placeholder } from '@wordpress/components';
import { _x } from '@wordpress/i18n';
import classnames from 'classnames';
import './edit.scss';

type EmbedPlaceHolderProps = {
	icon: JSX.Element;
	label: string;
	className: string;
	instructions: string;
	notices?: JSX.Element | undefined;
	onSubmit(): void;
	placeholder: string;
	url: string;
	updateUrl( s: string ): void;
};

export const EmbedPlaceHolder = ( props: EmbedPlaceHolderProps ) => {
	return (
		<div className={ classnames( 'hb-support-page-embed-placeholder', props.className ) }>
			<Placeholder
				icon={ props.icon }
				label={ props.label }
				instructions={ props.instructions }
				notices={ props.notices }
			>
				<form
					onSubmit={ ( event ) => {
						event.preventDefault();
						props.onSubmit();
					} }
				>
					<input
						type="url"
						value={ props.url }
						className="components-placeholder__input"
						placeholder={ props.placeholder }
						onChange={ ( event ) => props.updateUrl( event.target.value ) }
					/>
					<Button isPrimary type="submit">
						{ _x( 'Embed', 'button label', 'p2-blocks' ) }
					</Button>
				</form>
			</Placeholder>
		</div>
	);
};
