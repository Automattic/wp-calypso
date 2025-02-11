import './style.scss';

type Props = {
	children: React.ReactNode;
};

export default function FormFooter( { children }: Props ) {
	return <footer className="a4a-form__footer">{ children }</footer>;
}
