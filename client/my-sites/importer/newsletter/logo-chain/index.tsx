import ImporterLogo from 'calypso/my-sites/importer/importer-logo';

import './styles.scss';

type Logo = {
	name: string;
	color: string;
};

type LogoChainProps = {
	logos: Logo[];
};

export default function LogoChain( { logos }: LogoChainProps ) {
	return (
		<div className="logo-chain">
			{ logos.map( ( logo ) => (
				<div key={ logo.name } className="logo-chain__logo" style={ { background: logo.color } }>
					<ImporterLogo key={ logo.name } icon={ logo.name } />
				</div>
			) ) }
		</div>
	);
}
