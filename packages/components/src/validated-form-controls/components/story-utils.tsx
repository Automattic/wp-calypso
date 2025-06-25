import { Button } from '@wordpress/components';
import type { Meta } from '@storybook/react';

export const formDecorator: Meta[ 'decorators' ] = ( Story ) => (
	<form
		style={ {
			fontFamily: 'sans-serif',
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'flex-start',
			gap: 16,
		} }
		onSubmit={ ( e ) => {
			e.preventDefault();
			alert( 'Form submitted!' );
		} }
	>
		<div
			style={ {
				display: 'flex',
				flexDirection: 'column',
				gap: 16,
				alignItems: 'stretch',
				width: 300,
			} }
		>
			<Story />
		</div>

		<Button variant="primary" type="submit" __next40pxDefaultSize>
			Submit
		</Button>
	</form>
);
