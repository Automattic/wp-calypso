import styles from './index.module.css';

export const Test = ( { children }: { children?: React.ReactNode } ) => (
	<div className={ styles.example }>{ children ?? 'Test default content' }</div>
);
