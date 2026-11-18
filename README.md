# Ônibus SP Alerta

App mobile em React Native (Expo) que ajuda quem anda de ônibus em São Paulo usando a **API Olho Vivo (SPTrans)**, o **GPS** e as **notificações** do celular.
Área de desafio: *Citizen Intelligence & Predictive Analytics* — monitoramento da cidade para melhorar a qualidade de vida do cidadão.

## O que o app faz

1. **Ponto mais próximo** – usa o GPS para descobrir a rua onde o usuário está, busca os pontos de ônibus dessa rua na API e os ordena pela distância real (Haversine). Também há busca manual por rua.
2. **Próximos ônibus** – ao tocar em um ponto, mostra as linhas, o destino, os 3 próximos horários em minutos e destaca veículos acessíveis (♿). Atualiza a cada 30 s.
3. **Meu ônibus está chegando** – o usuário escolhe uma linha e a antecedência (3, 5 ou 10 min). Quando o ônibus estiver dentro desse tempo, o app envia **notificação local**, **vibra** e mostra um **Alert**.
4. **Hora de sair** – opcional: o GPS calcula a distância até o ponto, estima o tempo de caminhada (80 m/min) e soma à antecedência, avisando a hora certa de sair de casa.

Interface com fonte grande e alto contraste. As permissões de GPS e notificação são pedidas apenas quando necessárias, com mensagens claras se forem negadas.

## Como executar

Pré-requisitos: Node.js 18+ e o app **Expo Go** no celular (Play Store / App Store).

1. Crie sua conta em https://www.sptrans.com.br/desenvolvedores/ , acesse **Meus Aplicativos** e gere um token.
2. Instale as dependências:
   ```bash
   npm install
   npx expo install --fix
   ```
3. Configure o token:
   ```bash
   cp .env.example .env
   # edite .env e cole o token em EXPO_PUBLIC_OLHOVIVO_TOKEN
   ```
4. Inicie o projeto:
   ```bash
   npx expo start
   ```
5. Leia o QR Code com o Expo Go (Android) ou com a câmera (iPhone). Celular e computador devem estar na mesma rede Wi-Fi; se não for possível, use `npx expo start --tunnel`.

> Se alterar o `.env`, reinicie com `npx expo start -c`.

## Estrutura

```
App.js                      Navegação simples entre as duas telas
src/config.js               Constantes (URL, token, intervalos, limites)
src/theme.js                Cores, espaçamentos e fontes (alto contraste)
src/services/olhoVivo.js    Cliente da API (autenticação + endpoints)
src/services/location.js    GPS (expo-location)
src/services/notifications.js  Notificações locais (expo-notifications)
src/hooks/useBusAlert.js    Monitoramento da linha e disparo de alertas
src/utils/geo.js            Distância (Haversine) e tempo de caminhada
src/utils/arrivals.js       Conversão das respostas da API
src/screens/                NearbyScreen e StopScreen
src/components/             Button e Credits
```

## Limitações

- O monitoramento roda enquanto o app está aberto (consulta a cada 30 s); não há tarefa em segundo plano.
- A API não busca pontos por coordenadas; por isso o app usa o nome da rua obtido pelo GPS (geocodificação reversa) e filtra pela distância.

## Créditos

Dados de localização e previsão de chegada: **SPTrans – API Olho Vivo**. O crédito também aparece dentro do app.
