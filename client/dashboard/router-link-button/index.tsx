import { createLink } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { ButtonProps } from '@wordpress/components/build-types/button/types';
import { forwardRef } from 'react';

export function RouterLinkButton( props: ButtonProps, ref: React.Ref< HTMLButtonElement > ) {
	return <Button ref={ ref } { ...props } />;
}

export default createLink( forwardRef( RouterLinkButton ) );
