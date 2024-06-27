import { Button, ButtonProps } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import SectionHeader from 'calypso/components/section-header';

interface SettingsSectionHeaderProps extends Omit< ButtonProps, 'title' > {
	title: string | ReactNode;
	id?: string;
	isSaving?: boolean;
	showButton?: boolean;
	onButtonClick?: () => void;
	children?: ReactNode;
}

export default function SettingsSectionHeader( {
	children,
	title,
	id,
	isSaving,
	showButton,
	onButtonClick,
	...buttonProps
}: SettingsSectionHeaderProps ) {
	const translate = useTranslate();

	return (
		<SectionHeader label={ title } id={ id }>
			{ children }
			{ showButton && (
				<Button compact primary onClick={ onButtonClick } { ...buttonProps }>
					{ isSaving ? translate( 'Saving…' ) : translate( 'Save settings' ) }
				</Button>
			) }
		</SectionHeader>
	);
}
