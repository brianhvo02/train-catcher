import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { createTheme, NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import Head from 'next/head';

const darkTheme = createTheme({ type: 'dark' });
const lightTheme = createTheme({ type: 'light' });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NextThemesProvider
			defaultTheme="system"
			attribute="class"
			value={{
				light: lightTheme.className,
				dark: darkTheme.className
			}}
		>
      <NextUIProvider>
        <Head>
          <title>Train Catcher</title>
          <meta name="description" content="Generated by create next app" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Component {...pageProps} />
      </NextUIProvider>
    </NextThemesProvider>
  );
}
