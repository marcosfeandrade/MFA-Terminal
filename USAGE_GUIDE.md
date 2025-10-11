# 📖 Guia de Uso Detalhado - MFA Terminal

## 🔧 Configuração de Caminhos de Diretório

### Caminhos Relativos

Quando você especifica um caminho relativo, ele é resolvido **em relação ao workspace atual**:

```
✅ Correto:
./src              → workspace/src
./backend/api      → workspace/backend/api
subfolder          → workspace/subfolder

❌ Errado:
../outro-projeto   → Pode não funcionar conforme esperado
```

### Caminhos Absolutos

Você pode usar caminhos absolutos diretamente:

```
Windows:
C:\Users\marco\projeto\backend
D:\desenvolvimento\frontend

Linux/Mac:
/home/usuario/projeto/backend
/Users/usuario/projeto/frontend
```

### ⚠️ Importante

- **Workspace obrigatório**: Para usar caminhos relativos, você DEVE ter um workspace aberto
- **Diretório deve existir**: Se o diretório não existir, o terminal será criado no diretório padrão
- **Sem validação em tempo de criação**: Ao criar um perfil manualmente, os caminhos não são validados. A validação acontece apenas ao aplicar o perfil

## 📝 Exemplos Práticos

### Exemplo 1: Projeto Monorepo

Estrutura:
```
meu-projeto/
├── frontend/
├── backend/
└── shared/
```

Perfil "Dev Full Stack":
```json
Terminal 1: "Frontend"
  Comando: npm run dev
  Diretório: ./frontend

Terminal 2: "Backend"
  Comando: npm start
  Diretório: ./backend

Terminal 3: "Root"
  Comando: 
  Diretório: (deixe vazio para usar a raiz do workspace)
```

### Exemplo 2: Microserviços

Estrutura:
```
microservices/
├── auth-service/
├── user-service/
├── payment-service/
└── gateway/
```

Perfil "Todos os Serviços":
```json
Terminal 1: "Auth"
  Comando: npm run dev
  Diretório: ./auth-service

Terminal 2: "Users"
  Comando: npm run dev
  Diretório: ./user-service

Terminal 3: "Payments"
  Comando: npm run dev
  Diretório: ./payment-service

Terminal 4: "Gateway"
  Comando: npm run dev
  Diretório: ./gateway
```

### Exemplo 3: Docker + Desenvolvimento

Perfil "Docker Dev":
```json
Terminal 1: "Docker"
  Comando: docker-compose up
  Diretório: (raiz do projeto)

Terminal 2: "Frontend Dev"
  Comando: npm run dev
  Diretório: ./app

Terminal 3: "Logs"
  Comando: docker-compose logs -f
  Diretório: (raiz do projeto)
```

## 🛠️ Solução de Problemas

### Erro: "O diretório não existe"

**Causa**: O caminho especificado não aponta para um diretório válido

**Solução**:
1. Verifique se o diretório realmente existe no seu workspace
2. Certifique-se de que está usando o caminho correto (relativo ou absoluto)
3. Abra o workspace correto no VS Code
4. Se necessário, edite o perfil e corrija o caminho

### Erro: "Não é possível resolver caminhos relativos"

**Causa**: Nenhum workspace está aberto

**Solução**:
1. Abra uma pasta como workspace (File > Open Folder)
2. Ou use caminhos absolutos em vez de relativos

### Terminal abre no diretório errado

**Causa**: O workspace atual é diferente do esperado

**Solução**:
1. Verifique qual workspace está aberto
2. Edite o perfil e atualize os caminhos
3. Considere usar caminhos absolutos se trabalha com múltiplos workspaces

## 💡 Dicas e Boas Práticas

### 1. Nomeie os terminais de forma clara
```
✅ Bom: "Backend API", "Frontend React", "Database"
❌ Ruim: "Terminal 1", "Teste", "asdf"
```

### 2. Use descrições nos perfis
```
✅ Bom: "Ambiente de desenvolvimento com frontend React, backend Node.js e banco PostgreSQL"
❌ Ruim: "dev"
```

### 3. Agrupe perfis por contexto
```
✅ Organize assim:
- "Dev Full Stack"
- "Dev Frontend Only"
- "Dev Backend Only"
- "Testes E2E"
- "Deploy Production"
```

### 4. Inclua comandos úteis
```
✅ Comandos úteis:
- npm run dev
- docker-compose up
- npm test -- --watch
- git status
```

### 5. Evite comandos interativos
```
❌ Evite:
- npm init
- git commit (sem mensagem)
- comandos que requerem input do usuário

✅ Prefira:
- npm run dev
- npm test
- npm run build
```

## 🔄 Fluxo de Trabalho Recomendado

### Para Novos Projetos:

1. Configure seu ambiente de desenvolvimento
2. Abra todos os terminais necessários
3. Use `MFA Terminal: Salvar Perfil Atual`
4. Teste fechando todos os terminais
5. Use `MFA Terminal: Carregar Perfil` para verificar

### Para Projetos Existentes:

1. Use `MFA Terminal: Criar Novo Perfil`
2. Configure cada terminal manualmente
3. Teste aplicando o perfil
4. Ajuste conforme necessário com `MFA Terminal: Editar Perfil`

### Para Equipes:

*Futuro*: Funcionalidade de exportar/importar perfis permitirá compartilhar perfis com a equipe.

## 📞 Suporte

Se encontrar problemas:
1. Verifique se está usando a última versão da extensão
2. Consulte este guia
3. Reporte bugs com detalhes:
   - O que você estava tentando fazer
   - Qual erro apareceu
   - Qual workspace estava aberto
   - Qual comando você usou

