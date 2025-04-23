import { createLink } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { ButtonProps } from '@wordpress/components/build-types/button/types';
import { forwardRef } from 'react';

export default createLink(
	forwardRef( ( props: ButtonProps, ref: React.Ref< HTMLAnchorElement > ) => (
		<Button ref={ ref } { ...props } />
	) )
);
