import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FC, PropsWithChildren, ReactNode } from 'react';
import SectionHeader from 'calypso/components/section-header';

interface SettingsSectionHeaderProps extends PropsWithChildren {
	title: string | ReactNode;
	id?: string;
	isSaving?: boolean;
	showButton?: boolean;
	disabled?: boolean;
	onButtonClick?: () => void;
}

const SettingsSectionHeader: FC< SettingsSectionHeaderProps > = ( {
	children,
	title,
	id,
	isSaving,
	showButton,
	disabled,
	onButtonClick,
} ) => {
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
};

export default SettingsSectionHeader;
