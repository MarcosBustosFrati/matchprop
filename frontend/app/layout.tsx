export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: "Inter, system-ui, sans-serif", background:"#fafafa", color:"#111" }}>
        {children}
      </body>
    </html>
  );
}
