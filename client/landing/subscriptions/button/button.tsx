import { Button as BaseButton } from '@automattic/components';
import React from 'react';
import './styles.scss';

type ButtonProps = React.ComponentProps< typeof BaseButton >;

const Button = ( props: ButtonProps ) => (
	<BaseButton className="subscription-management--button" { ...props } />
);

export default Button;
