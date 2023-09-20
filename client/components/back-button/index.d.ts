import { FC, MouseEvent } from 'react';

declare interface BackButtonProps {
	onClick?: ( event: MouseEvent< HTMLButtonElement > ) => void;
	translate?: ( text: string ) => string;
}

declare const BackButton: FC< BackButtonProps >;

export default BackButton;
