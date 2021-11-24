import WordPressLogo from 'calypso/components/wordpress-logo';

interface Props {
	step: React.ReactNode;
}

export function SetupSite( { step }: Props ): React.ReactElement {
	return (
		<div>
			<header>
				<WordPressLogo size={ 120 } />
			</header>

			{ step }
		</div>
	);
}
