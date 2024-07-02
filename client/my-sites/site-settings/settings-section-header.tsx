import { Button, ButtonProps } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import SectionHeader from 'calypso/components/section-header';

interface SettingsSectionHeaderProps {
	title: string | ReactNode;
	id?: string;
	isSaving?: boolean;
	disabled?: boolean;
	showButton?: boolean;
	onButtonClick?: () => void;
	buttonProps?: Partial< ButtonProps >;
	children?: ReactNode;
}

export default function SettingsSectionHeader( {
	title,
	id,
	isSaving,
	disabled,
	showButton,
	onButtonClick,
	buttonProps,
	children,
}: SettingsSectionHeaderProps ) {
	const translate = useTranslate();

	return (
		<SectionHeader label={ title } id={ id }>
			{ children }
			{ showButton && (
				<Button compact primary disabled={ disabled } onClick={ onButtonClick } { ...buttonProps }>
					{ isSaving ? translate( 'Saving…' ) : translate( 'Save settings' ) }
				</Button>
			) }
		</SectionHeader>
	);
}
