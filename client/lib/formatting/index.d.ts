import type { ReactNode } from 'react';

export declare function preventWidows( text: string | ReactNode, wordsToKeep?: number = 2 ): string;
export declare function decodeEntities( text: string ): string;
export declare function capitalPDangit( text: string ): string;
export declare function stripHTML( text: string ): string;
