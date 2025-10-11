# 🖥️ MFA Terminal - Gerenciador de Layouts de Terminal

Uma extensão poderosa para VS Code e Cursor que permite salvar e carregar layouts de terminal com suporte a **splits** (terminais lado a lado), aumentando sua produtividade no desenvolvimento.

## ✨ Funcionalidades

- **💾 Salvar Perfis**: Capture o layout atual de seus terminais e salve como um layout reutilizável
- **🔲 Suporte a Splits**: Organize terminais em grupos - terminais no mesmo grupo ficam lado a lado (splitados)
- **📂 Carregar Perfis**: Restaure rapidamente seus layouts de terminal favoritos com a estrutura exata de grupos
- **✏️ Criar Perfis**: Crie perfis personalizados do zero com interface assistida
- **🎯 Organização Flexível**: Escolha como organizar seus terminais:
  - Cada terminal separado
  - Todos splitados juntos
  - Organização manual personalizada
- **📝 Editar Perfis**: Modifique nome, descrição ou atualize o layout de perfis existentes
- **🗑️ Deletar Perfis**: Remova perfis que não são mais necessários
- **📋 Listar Perfis**: Visualize todos os seus perfis salvos em um só lugar

## 🚀 Como Usar

### 1. Salvar um Layout com Splits

1. Abra os terminais que você usa regularmente
2. Abra a paleta de comandos (`Ctrl+Shift+P` ou `Cmd+Shift+P`)
3. Digite e selecione: `MFA Terminal: Salvar Layout Atual`
4. Escolha como organizar os terminais:
   - **Cada terminal em seu próprio grupo**: Terminais separados
   - **Todos splitados em um grupo**: Todos lado a lado
   - **Organizar manualmente**: Escolha quais terminais ficam juntos
5. Dê um nome ao layout (ex: "Desenvolvimento Full Stack")
6. Adicione uma descrição opcional
7. Pronto! Seu layout com layout de splits foi salvo ✅

### 2. Carregar um Layout

1. Abra a paleta de comandos
2. Digite e selecione: `MFA Terminal: Carregar Layout`
3. Escolha o layout desejado da lista
4. Escolha se deseja manter ou fechar terminais existentes
5. Seus terminais serão criados automaticamente com a estrutura de splits! 🎉
   - Terminais do mesmo grupo aparecerão lado a lado (splitados)
   - Grupos diferentes aparecerão em painéis separados

### 3. Criar um Layout Personalizado

1. Abra a paleta de comandos
2. Digite e selecione: `MFA Terminal: Criar Novo Layout`
3. Siga o assistente interativo:
   - Digite o nome do layout
   - Adicione uma descrição (opcional)
   - Configure cada terminal:
     - Nome do terminal
     - Comando a executar (opcional)
     - Diretório de trabalho (opcional)
   - Adicione quantos terminais desejar

### 4. Gerenciar Perfis

Use o comando `MFA Terminal: Listar Perfis` para:
- Ver todos os seus perfis
- Carregar um layout
- Editar um layout existente
- Deletar perfis

## 📋 Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `MFA Terminal: Salvar Layout Atual` | Salva o layout atual de terminais como um novo layout |
| `MFA Terminal: Carregar Layout` | Carrega e aplica um layout salvo |
| `MFA Terminal: Listar Perfis` | Exibe todos os perfis com opções de gerenciamento |
| `MFA Terminal: Criar Novo Layout` | Cria um layout personalizado do zero |
| `MFA Terminal: Editar Layout` | Edita nome, descrição ou layout de um layout |
| `MFA Terminal: Deletar Layout` | Remove um layout |

## 💡 Casos de Uso

### Desenvolvimento Full Stack
Crie um layout com 2 grupos:
- **Grupo 1 (splitado)**: Backend + Frontend lado a lado
- **Grupo 2**: Database separado
- **Grupo 3**: Terminal para testes

Resultado: Backend e Frontend ficam lado a lado, enquanto Database e Testes ficam em painéis separados.

### Desenvolvimento Microserviços
Configure perfis com grupos de serviços:
- **Grupo 1 (splitado)**: Auth + Users + Payments lado a lado
- **Grupo 2**: API Gateway separado

Resultado: Todos os microserviços principais lado a lado, com o gateway em painel separado.

### Projetos Monorepo
Organize terminais por pacote:
- Workspace principal
- Package 1
- Package 2
- Scripts compartilhados

## ⚙️ Configuração de Perfis

Cada terminal em um layout pode ter:

- **Nome**: Identificação do terminal
- **Comando**: Comando executado automaticamente ao criar o terminal
- **Diretório**: Pasta onde o terminal será aberto
  - ✅ Caminhos relativos: `./src`, `./backend/api`
  - ✅ Caminhos absolutos: `C:\projetos\backend`, `/home/user/projeto`
  - ⚠️ Caminhos relativos são resolvidos em relação ao workspace atual
  - ⚠️ O diretório deve existir, caso contrário o terminal usa o diretório padrão
- **Variáveis de Ambiente**: Variáveis personalizadas (em desenvolvimento)
- **Ícone**: Ícone personalizado do terminal (em desenvolvimento)
- **Cor**: Cor personalizada do terminal (em desenvolvimento)

### 📖 Uso de Caminhos

**Importante**: Ao especificar diretórios para os terminais:

- **Caminhos Relativos** (ex: `./backend`, `src/components`):
  - São resolvidos em relação ao workspace aberto
  - Requerem que você tenha uma pasta aberta como workspace
  
- **Caminhos Absolutos** (ex: `C:\Users\marco\projeto`):
  - Funcionam diretamente sem necessidade de workspace
  - Úteis quando trabalha com projetos em locais diferentes

- **Validação**: Se o diretório não existir, você receberá um aviso e o terminal será criado no diretório padrão

📚 **[Veja o guia de uso detalhado](./USAGE_GUIDE.md)** para mais exemplos e boas práticas

## 📁 Armazenamento

Os perfis são salvos no armazenamento global do VS Code/Cursor, o que significa que:
- ✅ Seus perfis ficam disponíveis em todos os seus workspaces
- ✅ Os perfis persistem entre reinicializações do editor
- ✅ Você pode ter quantos perfis quiser

## 🔧 Requisitos

- VS Code versão 1.105.0 ou superior
- Cursor (qualquer versão recente)

## 🐛 Problemas Conhecidos

- A API do VS Code não permite capturar automaticamente o diretório atual ou comandos já executados em terminais existentes. Ao salvar um layout baseado em terminais abertos, você precisará configurar manualmente os comandos e diretórios se quiser incluí-los no layout.

## 📝 Roadmap

- [ ] Atalhos de teclado personalizáveis
- [ ] Exportar/Importar perfis (compartilhar com a equipe)
- [ ] Perfis por workspace (específicos para cada projeto)
- [ ] Suporte a variáveis no caminho do diretório
- [ ] Grupos de terminais (split terminals)
- [ ] Temas/cores personalizadas por layout

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests

## 📄 Licença

MIT

## 👨‍💻 Autor

Desenvolvido com ❤️ para aumentar a produtividade no desenvolvimento

---

**Aproveite a extensão!** Se você achou útil, considere deixar uma ⭐ avaliação!
