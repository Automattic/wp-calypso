import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import SectionHeader from 'calypso/components/section-header';

interface SettingsSectionHeaderProps {
	title: string | ReactNode;
	id?: string;
	isSaving?: boolean;
	showButton?: boolean;
	disabled?: boolean;
	onButtonClick?: () => void;
	children?: ReactNode;
}

export default function SettingsSectionHeader( {
	children,
	title,
	id,
	isSaving,
	showButton,
	disabled,
	onButtonClick,
}: SettingsSectionHeaderProps ) {
	const translate = useTranslate();

	return (
		<SectionHeader label={ title } id={ id }>
			{ children }
			{ showButton && (
				<Button compact primary disabled={ disabled } onClick={ onButtonClick }>
					{ isSaving ? translate( 'Saving…' ) : translate( 'Save settings' ) }
				</Button>
			) }
		</SectionHeader>
	);
}
